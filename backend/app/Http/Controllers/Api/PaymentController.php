<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\ConfirmPaymentUseCase;
use App\Application\UseCases\CreateVnpayPaymentUseCase;
use App\Exceptions\EntityNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Models\Booking;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function create($bookingId, CreateVnpayPaymentUseCase $usecase) {
        $booking = Booking::find($bookingId);
        if (!$booking) throw new EntityNotFoundException("Không tìm thấy Booking");
        if($booking->status->value != "PENDING"){
            throw new EntityNotFoundException("Không tìm thấy Booking co trang thai la PENDING");
        }
        $paymentUrl = $usecase->execute($booking);
        return ApiResponse::success($paymentUrl);
    }

    public function vnpayReturn(Request $request, ConfirmPaymentUseCase $confirmPaymentUseCase) {
    if ($this->validateVnpaySignature($request)) {
        
        $txnRefData = explode('_', $request->vnp_TxnRef);
        $bookingId = $txnRefData[0];

<<<<<<< HEAD
        if ($request->vnp_ResponseCode == '00') {
            try {
                // TRUYỀN ĐÚNG THỨ TỰ: 
                // 1. ID, 2. Method, 3. TxnRef, 4. Amount, 5. TransactionNo, 6. All Data
                $booking = $confirmPaymentUseCase->execute(
                    (int) $bookingId, 
                    'VNPAY', 
                    $request->vnp_TxnRef,                 // gateway_reference
                    (float) ($request->vnp_Amount / 100), // amount
                    $request->vnp_TransactionNo,          // gateway_transaction_id
                    $request->all()                       // gateway_response (Dùng để lấy vnp_PayDate sau này)
                );
                
                return ApiResponse::success($booking, "Thanh toán thành công.");
            } catch (\Exception $e) {
                return ApiResponse::error($e->getMessage(), 400);
            }
        }
        return ApiResponse::error("Giao dịch thất bại. Mã lỗi: " . $request->vnp_ResponseCode);
=======
            if ($request->vnp_ResponseCode == '00') {
                try {
                    $booking = $confirmPaymentUseCase->execute(
                        (int) $bookingId, 
                        'VNPAY', 
                        $request->vnp_TransactionNo,
                        (float) ($request->vnp_Amount / 100)
                    );

                    $booking->load([
                        'tickets.passenger',
                        'tickets.flight_instance.flightSchedule'
                    ]);
                    
                    // Trả về View Thành Công kèm theo dữ liệu booking
                    return view('payment.success', compact('booking'));
                    
                } catch (\Exception $e) {
                    // Lỗi logic hệ thống (VD: Không tìm thấy booking, sai tiền...)
                    return view('payment.error', [
                        'message' => 'Lỗi xử lý hệ thống: ' . $e->getMessage()
                    ]);
                }
            }
            // Lỗi từ phía VNPAY (Khách hủy giao dịch, không đủ tiền...)
            return view('payment.error', [
                'message' => 'Giao dịch thất bại. Mã lỗi VNPAY: ' . $request->vnp_ResponseCode
            ]);
        }
        
        // Lỗi sai chữ ký (Cảnh báo gian lận)
        return view('payment.error', [
            'message' => 'Sai chữ ký bảo mật. Giao dịch bị từ chối!'
        ]);
>>>>>>> 03719d73814324916421bcafb250e351c1e9c262
    }
    return ApiResponse::error("Sai chữ ký bảo mật.");
}

    public function vnpayIpn(Request $request, ConfirmPaymentUseCase $confirmPaymentUseCase)
    {
        
        if (!$this->validateVnpaySignature($request)) {
            return response()->json(['RspCode' => '97', 'Message' => 'Invalid signature']);
        }

        try {
            $txnRefData = explode('_', $request->vnp_TxnRef);
            $bookingId = $txnRefData[0];
            $booking = Booking::find($bookingId);

            if (!$booking) {
                return response()->json(['RspCode' => '01', 'Message' => 'Order not found']);
            }

            // Kiểm tra số tiền
            if (($request->vnp_Amount / 100) != $booking->total_amount) {
                return response()->json(['RspCode' => '04', 'Message' => 'Invalid amount']);
            }

            // Kiểm tra trạng thái đã thanh toán chưa
            if ($booking->status === 'PAID') {
                return response()->json(['RspCode' => '02', 'Message' => 'Order already confirmed']);
            }

            // XỬ LÝ CHÍNH
            if ($request->vnp_ResponseCode == '00') {
                // Toàn bộ logic Update DB nằm trong này
                $confirmPaymentUseCase->execute(
                    (int) $bookingId, 
                    'VNPAY', 
                    $request->vnp_TxnRef,                 // gateway_reference
                    (float) ($request->vnp_Amount / 100), // amount
                    $request->vnp_TransactionNo,          // gateway_transaction_id
                    $request->all()                       // gateway_response
                );
            } else {
                // Nếu thất bại thì chỉ cập nhật trạng thái Booking
                $booking->update(['status' => 'CANCELLED']);
            }

            return response()->json(['RspCode' => '00', 'Message' => 'Confirm Success']);

        } catch (\Exception $e) {
            return response()->json(['RspCode' => '99', 'Message' => 'Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Hàm phụ trợ để kiểm tra chữ ký VNPAY (Tránh lặp code)
     */
    private function validateVnpaySignature(Request $request) {
        $vnp_HashSecret = config('vnpay.hash_secret');
        $inputData = $request->all();
        $vnp_SecureHash = $inputData['vnp_SecureHash'] ?? '';
        unset($inputData['vnp_SecureHash'], $inputData['vnp_SecureHashType']);

        ksort($inputData);
        $hashData = "";
        foreach ($inputData as $key => $value) {
            $hashData .= urlencode($key) . "=" . urlencode($value) . '&';
        }
        $hashData = rtrim($hashData, '&');
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        return ($secureHash === $vnp_SecureHash);
    }
}