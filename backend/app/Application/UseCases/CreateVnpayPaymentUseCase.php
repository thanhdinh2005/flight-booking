<?php

namespace App\Application\UseCases;

class CreateVnpayPaymentUseCase
{
    public function execute($booking)
    {
        $vnpUrl = config('vnpay.url');
        $vnpReturnUrl = config('vnpay.return_url');
        $vnpTmnCode = config('vnpay.tmn_code');
        $vnpHashSecret = config('vnpay.hash_secret');

        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnpTmnCode,
            "vnp_Amount" => $booking->total_amount * 100,
            "vnp_Command" => "pay",
            // Force timezone VN để tránh lỗi nếu server đang chạy giờ UTC
            "vnp_CreateDate" => now()->timezone('Asia/Ho_Chi_Minh')->format('YmdHis'), 
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => request()->ip(),
            "vnp_Locale" => "vn",
            "vnp_OrderInfo" => "Thanh toan booking " . $booking->id, // Hạn chế dùng ký tự đặc biệt như '#' ở đây
            "vnp_OrderType" => "250000", // "250000" là mã danh mục Vé máy bay chuẩn của VNPAY, hoặc dùng "other"
            "vnp_ReturnUrl" => $vnpReturnUrl,
            "vnp_TxnRef" => $booking->id . '_' . time() // Đảm bảo chuỗi này <= 50 ký tự
        ];

        // 1. Sắp xếp mảng theo thứ tự bảng chữ cái của key
        ksort($inputData);

        $query = "";
        $hashdata = "";
        
        // 2. Nối chuỗi chuẩn theo đúng sample của VNPAY
        foreach ($inputData as $key => $value) {
            $hashdata .= urlencode($key) . "=" . urlencode($value) . '&';
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        // Xóa dấu '&' thừa ở cuối chuỗi
        $hashdata = rtrim($hashdata, '&');
        $query = rtrim($query, '&');

        // 3. Tạo chữ ký
        $secureHash = hash_hmac('sha512', $hashdata, $vnpHashSecret);

        // 4. Trả về URL hoàn chỉnh
        return $vnpUrl . '?' . $query . '&vnp_SecureHash=' . $secureHash;
    }
}