<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\CreateVnpayPaymentUseCase;
use App\Exceptions\EntityNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function create($bookingId, CreateVnpayPaymentUseCase $usecase) {
        $booking = Booking::find($bookingId);

        if (!$booking) throw new EntityNotFoundException("Không tìm thấy Booking");

        $paymentUrl = $usecase->execute($booking);

        return ApiResponse::success($paymentUrl);
    }

    public function vnpayReturn(Request $request) {
        $vnp_HashSecret = config('vnpay.hash_secret');

        // 1. Lấy toàn bộ dữ liệu VNPAY trả về
        $inputData = array();
        foreach ($request->all() as $key => $value) {
            if (substr($key, 0, 4) == "vnp_") {
                $inputData[$key] = $value;
            }
        }

        // 2. Tách mã hash VNPAY gửi sang để kiểm tra
        $vnp_SecureHash = $inputData['vnp_SecureHash'] ?? '';
        unset($inputData['vnp_SecureHash']);
        unset($inputData['vnp_SecureHashType']);

        // 3. Sắp xếp mảng và tạo chuỗi hash giống hệt lúc gửi đi
        ksort($inputData);
        $query = "";
        $hashData = "";
        foreach ($inputData as $key => $value) {
            $hashData .= urlencode($key) . "=" . urlencode($value) . '&';
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }
        $hashData = rtrim($hashData, '&');
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        if ($secureHash == $vnp_SecureHash) {
            $bookingId = $request->vnp_TxnRef; // Lấy ID đơn hàng
            $vnp_ResponseCode = $request->vnp_ResponseCode;

            $txnRefData = explode('_', $request->vnp_TxnRef);
            $bookingId = $txnRefData[0]; // Kết quả sẽ lấy được số 1

            $booking = Booking::find($bookingId);

            if (!$booking) throw new EntityNotFoundException("Không tìm thấy đơn hàng!");

            if ($vnp_ResponseCode == '00') {
                try {
                // GỌI USECASE TẠI ĐÂY
                $booking = $confirmPaymentUseCase->execute(
                    (int) $bookingId, 
                    'VNPAY', 
                    $request->vnp_TransactionNo // Mã giao dịch thực tế từ VNPAY
                );

                return ApiResponse::success($booking, "Thanh toán thành công và đã xuất vé.");

            } catch (\Exception $e) {
                // Trường hợp có lỗi logic (ví dụ: Booking đã bị hủy do hết hạn trước đó)
                return ApiResponse::error($e->getMessage(), 400);
            }

            } else {
                return ApiResponse::error("Giao dịch không thành công. Mã lỗi ". $vnp_ResponseCode);
            }
        } else {
            return ApiResponse::error($hashData. ' ' . $secureHash . ' ' .strlen($vnp_HashSecret));
        }
    }

    public function vnpayIpn(Request $request)
    {
        $vnp_HashSecret = config('vnpay.hash_secret');
        $inputData = array();
        
        foreach ($request->query() as $key => $value) {
            if (substr($key, 0, 4) == "vnp_") {
                $inputData[$key] = $value;
            }
        }

        $vnp_SecureHash = $inputData['vnp_SecureHash'] ?? '';
        unset($inputData['vnp_SecureHash']);
        unset($inputData['vnp_SecureHashType']);

        ksort($inputData);
        $hashData = "";
        foreach ($inputData as $key => $value) {
            $hashData .= urlencode($key) . "=" . urlencode($value) . '&';
        }
        $hashData = rtrim($hashData, '&');
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        // 1. Kiểm tra chữ ký
        if ($secureHash !== $vnp_SecureHash) {
            return response()->json(['RspCode' => '97', 'Message' => 'Invalid signature']);
        }

        try {
            $bookingId = $request->vnp_TxnRef;
            $booking = Booking::find($bookingId);

            // 2. Kiểm tra đơn hàng có tồn tại không
            if (!$booking) {
                return response()->json(['RspCode' => '01', 'Message' => 'Order not found']);
            }

            // 3. Kiểm tra số tiền có khớp không (VNPAY gửi về số tiền đã nhân 100)
            $vnp_Amount = $request->vnp_Amount / 100;
            if ($booking->total_amount != $vnp_Amount) {
                return response()->json(['RspCode' => '04', 'Message' => 'invalid amount']);
            }

            // 4. Kiểm tra trạng thái đơn hàng (Đảm bảo chưa được update trước đó)
            if ($booking->status === 'PAID') { // Thay 'PAID' bằng trạng thái thành công của bạn
                return response()->json(['RspCode' => '02', 'Message' => 'Order already confirmed']);
            }

            // 5. Nếu mọi thứ hợp lệ, tiến hành cập nhật DB
            DB::beginTransaction();

            if ($request->vnp_ResponseCode == '00') {
                // Thanh toán thành công
                $booking->update([
                    'status' => BookingStatus::PAID, // Dùng Enum chuẩn
                    'expires_at' => null,            // Thanh toán xong thì không còn hạn giữ chỗ
    ]);
    // 2. Kích hoạt toàn bộ Vé thuộc Booking này sang ACTIVE
            $booking->tickets()->update([
                'status' => TicketStatus::ACTIVE // Giúp vé có hiệu lực để bay
            ]);
            // 2. Gửi Email cho khách hàng
    // Nên dùng queue (Mail::to(...)->queue(...)) để không làm chậm tốc độ phản hồi của API
            Mail::to($booking->contact_email)->queue(new BookingConfirmedMail($booking));
            } else {
                // Thanh toán thất bại
                $booking->update(['status' => 'PENDING']);
                // Bạn có thể lưu transaction thất bại vào đây nếu muốn
            }

            DB::commit();

            // 6. Trả về mã thành công cho VNPAY biết để họ không gọi lại nữa
            return response()->json(['RspCode' => '00', 'Message' => 'Confirm Success']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['RspCode' => '99', 'Message' => 'Unknown error']);
        }
    }

    
}
