<?php

namespace App\Application\Command\Refund;

use App\Exceptions\BusinessException;
use Illuminate\Support\Facades\Http;

class CallVnpayRefundCommand
{
    public function execute ($booking, $paymentTransaction, $refundAmount, $staffId) {
        $vnp_TmnCode = config('vnpay.tmn_code');
        $vnp_HashSecret = config('vnpay.hash_secret');
        $vnp_ApiUrl = config('vnpay.refund_url', 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction');

        $data = [
            "vnp_RequestId" => time() . rand(1000, 9999),
            "vnp_Version" => '2.1.0',
            "vnp_Command" => 'refund',
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_TransactionType" => '02',
            "vnp_TxnRef" => (string) $booking->id,
            "vnp_Amount" => $refundAmount * 100,
            "vnp_TransactionNo" => (string) $paymentTransaction->gateway_transaction_id,
            "vnp_TransactionDate" => $paymentTransaction->created_at->timezone('Asia/Ho_Chi_Minh')->format('YmdHis'),
            "vnp_CreateBy" => (string) $staffId,
            "vnp_CreateDate" => now()->timezone('Asia/Ho_Chi_Minh')->format('YmdHis'),
            "vnp_IpAddr" => request()->ip(),
            "vnp_OrderInfo" => "Hoan tien booking " . $booking->id
        ];

        $formatStr = implode('|', array_values($data));
        $data['vnp_SecureHash'] = hash_hmac('sha512', $formatStr, $vnp_HashSecret);

        // Gọi API
        $response = Http::post($vnp_ApiUrl, $data);
        $result = $response->json();

        if (!$result || $result['vnp_ResponseId'] !== '00') {
            $errorMsg = $result['vnp_Message'] ?? 'Lỗi không xác định từ VNPAY';
            throw new BusinessException("VNPAY từ chối hoàn tiền: " . $errorMsg);
        }

        return $result;
    }

}