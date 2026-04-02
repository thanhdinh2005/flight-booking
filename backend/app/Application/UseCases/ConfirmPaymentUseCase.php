<?php

namespace App\Application\UseCases;

use App\Models\Booking;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingConfirmedMail;
use Exception;

class ConfirmPaymentUseCase
{
    /**
     * @param array $gatewayResponse Thêm tham số này để lưu vnp_PayDate, vnp_BankCode...
     */
    public function execute(
    int $bookingId, 
    string $paymentMethod, 
    string $gatewayReference,  // Tham số thứ 3: vnp_TxnRef
    float $amount,             // Tham số thứ 4: vnp_Amount / 100
    string $transactionId,     // Tham số thứ 5: vnp_TransactionNo
    array $gatewayResponse = [] // Tham số thứ 6: Toàn bộ data $request->all()
)
    {
        return DB::transaction(function () use ($bookingId, $paymentMethod, $transactionId, $amount, $gatewayResponse) {
            
            // 1. Tìm Booking và khóa bản ghi
            $booking = Booking::with(['tickets.passenger', 'tickets.flight_instance.flightSchedule.route'])
                ->lockForUpdate()
                ->findOrFail($bookingId);

            if ($booking->status === 'PAID') {
                return $booking;
            }

            // 2. Cập nhật trạng thái Booking
            $booking->update([
                'status'     => 'PAID',
                //'paid_at'    => now(),
                'expires_at' => null,
            ]);

            // 3. Cập nhật tất cả các vé liên quan thành ACTIVE
            $booking->tickets()->update([
                'status' => 'ACTIVE'
            ]);

            // 4. Tạo giao dịch (Transaction) - QUAN TRỌNG: Lưu gateway_response
            Transaction::create([
                'booking_id'             => $booking->id,
                'amount'                 => $amount,
                'type'                   => 'PAYMENT',
                'payment_method'         => $paymentMethod,
                'gateway_transaction_id' => $transactionId, // vnp_TransactionNo
                'gateway_reference'      => $gatewayResponse['vnp_TxnRef'] ?? null, // vnp_TxnRef
                'gateway_response'       => $gatewayResponse, // Lưu toàn bộ JSON để lấy vnp_PayDate sau này
                'status'                 => 'SUCCESS',
            ]);

            // 5. Gửi Mail xác nhận (Dùng queue để tối ưu hiệu năng)
            if ($booking->contact_email) {
                Mail::to($booking->contact_email)->queue(new BookingConfirmedMail($booking));
            }

            return $booking;
        });
    }
}