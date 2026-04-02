<?php

namespace App\Application\UseCases\Refund;

use App\Models\BookingRequest;
use App\Models\Transaction;
use App\Enums\Booking\RequestStatus;
use App\Enums\Booking\TicketStatus;
use App\Application\Command\Refund\CallVnpayRefundCommand;
use App\Mail\CustomerRequestStatusUpdatedMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Exception;

class AdminApproveRefundUseCase
{
    public function __construct(
        protected CallVnpayRefundCommand $vnpayCmd
    ) {}

    public function execute(int $requestId, int $staffId)
    {
        // 1. Tìm chính xác Request theo ID để tránh nhầm lẫn giữa các vé trong cùng Booking
        $request = BookingRequest::with(['booking.transactions', 'ticket'])
            ->where('id', $requestId)
            ->lockForUpdate() 
            ->firstOrFail();

        if ($request->status !== RequestStatus::PENDING) {
            throw new Exception("Yêu cầu hoàn tiền này đã được xử lý trước đó.");
        }

        //Kiem tra so tien admin nhap vao so vuot qua so tien thanh toan ko
        $ticket_price = $request->ticket->ticket_price;
        $addon_price = $request->ticket->addons()->sum(DB::raw('amount * quantity'));
        $total_paid = $ticket_price + $addon_price;
        if($request->refund_amount > $total_paid){
            throw new Exception("Số tiền hoàn không được vượt quá tổng số tiền đã thanh toán (Vé + Addons).");
        }

        // 2. Tìm giao dịch thanh toán gốc thành công để lấy dữ liệu vnp_TransactionNo & vnp_PayDate
        $paymentTx = $request->booking->transactions()
            ->where('type', 'PAYMENT')
            ->where('status', 'SUCCESS')
            ->first();
// 3. KIỂM TRA VÀ SHOW THÔNG TIN TRƯỚC KHI GỌI VNPAY
$refundData = [
    'vnp_TxnRef'         => $paymentTx->gateway_reference,
    'vnp_TransactionNo'  => $paymentTx->gateway_transaction_id,
    'vnp_PayDate'        => $paymentTx->gateway_response['vnp_PayDate'] ?? null,
    'refund_amount'      => (float) $request->refund_amount,
    'staff_id'           => $staffId,
    'order_info'         => "Hoan tien yeu cau #" . $request->id
];

// --- CÁCH 1: GHI LOG ĐỂ KIỂM TRA (An toàn cho môi trường chạy thật) ---
\Log::info("--- DỮ LIỆU CHUẨN BỊ GỬI VNPAY ---", $refundData);

// --- CÁCH 2: DỪNG CHƯƠNG TRÌNH ĐỂ XEM (Chỉ dùng khi đang Dev/Debug) ---
// Nếu bạn muốn thấy ngay trên Postman/Trình duyệt, hãy bỏ comment dòng dưới:
// dd($refundData); 

// 4. KIỂM TRA TÍNH HỢP LỆ CỦA CÁC GIÁ TRỊ CỐT LÕI
if (empty($refundData['vnp_PayDate'])) {
    throw new Exception("Giao dịch gốc thiếu vnp_PayDate (Dữ liệu không đủ để hoàn tiền).");
}

if (empty($refundData['vnp_TransactionNo'])) {
    throw new Exception("Giao dịch gốc thiếu mã tham chiếu VNPAY.");
}
        if (!$paymentTx) {
            throw new Exception("Không tìm thấy giao dịch gốc để thực hiện hoàn tiền qua cổng thanh toán.");
        }

        if(!$request->refund_amount || $request->refund_amount <= 0){
            throw new Exception("Số tiền hoàn không hợp lệ.");
        }

       
        if(!$staffId){
            throw new Exception("Không xác định được nhân viên xử lý yêu cầu.");
        }
        
        try {
            
            // 3. Gọi VNPAY API (Thực hiện hoàn tiền thật)
            // Lấy vnp_PayDate từ gateway_response đã lưu trong paymentTx
            $vnpayResponse = $this->vnpayCmd->execute(
                $paymentTx, 
                (float) $request->refund_amount, 
                $staffId
            );

            // 4. Cập nhật Database sau khi VNPAY trả về mã 00 (Thành công)
            return DB::transaction(function () use ($request, $vnpayResponse, $staffId) {
                $booking = $request->booking;
                // Cập nhật trạng thái Request
                $request->update([
                    'status' => RequestStatus::APPROVED,
                    'processed_at' => now(),
                    'staff_id' => $staffId
                ]);

                // Cập nhật trạng thái vé sang REFUNDED
                $request->ticket->update(['status' => TicketStatus::REFUNDED->value]);
               // $booking->total_amount -= $request->refund_amount;
                // Tạo Transaction loại REFUND để đối soát
                Transaction::create([
                    'booking_id'             => $request->booking_id,
                    'amount'                 => $request->refund_amount,
                    'type'                   => 'REFUND',
                    'payment_method'         => 'VNPAY',
                    'gateway_reference'      => 'REF_REQ_' . $request->id,
                    'gateway_transaction_id' => $vnpayResponse['vnp_ResponseId'] ?? 'N/A',
                    'gateway_response'       => $vnpayResponse, // Lưu full log refund
                    'status'                 => 'SUCCESS',
                ]);

                // Giải phóng ghế (Tăng số lượng ghế trống khả dụng)
                $this->restoreSeat($request->ticket);

                // 5. GỬI 01 MAIL DUY NHẤT THÔNG BÁO THÀNH CÔNG
                // Nội dung mail nên bao gồm lưu ý về thời gian tiền về (3-7 ngày)
                if ($request->booking->contact_email) {
                    //Mail::to($request->booking->contact_email)->queue(new RefundSuccessMail($request));
                    Mail::to($request->booking->contact_email)->queue(new CustomerRequestStatusUpdatedMail($request));
                    }

                return true;
            });

        } catch (Exception $e) {
            // Lưu lại lý do lỗi từ VNPAY để Admin có thể kiểm tra (VD: Sai checksum, giao dịch quá hạn...)
            $request->update(['staff_note' => 'Lỗi VNPAY Refund: ' . $e->getMessage()]);
            throw $e;
        }
    }

    /**
     * Hoàn lại chỗ vào kho ghế
     */
    private function restoreSeat($ticket) 
    {
        $inventory = \App\Models\FlightSeatInventory::where('flight_instance_id', $ticket->flight_instance_id)
            ->where('seat_class', $ticket->seat_class)
            ->first();

        if ($inventory) {
            $inventory->increment('available_seats');
        }
    }
}
