<?php

namespace App\Application\Command\Refund;

use App\Exceptions\BusinessException;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;
use Illuminate\Support\Str;

class CallVnpayRefundCommand
{
    public function execute($paymentTransaction, float $refundAmount, int|string $staffId): array
    {
        $vnp_TmnCode = config('vnpay.tmn_code');
        $vnp_HashSecret = config('vnpay.hash_secret');
        $vnp_ApiUrl = config('vnpay.refund_url');
// Debug nhanh nếu vẫn lỗi:
if (!$vnp_ApiUrl) {
    throw new \Exception("Cấu hình vnpay.refund_url đang bị trống!");
}
        if (blank($paymentTransaction->gateway_reference)) {
            throw new BusinessException('Giao dịch thanh toán không có vnp_TxnRef để hoàn tiền.');
        }

        // 1. Chuẩn bị các tham số
        $vnp_RequestId = now()->timezone('Asia/Ho_Chi_Minh')->format('YmdHis') . random_int(100, 999);
        $vnp_Version = '2.1.0';
        $vnp_Command = 'refund';
        $vnp_TransactionType = '02'; // Dùng 03 cho linh hoạt (hoàn 1 phần hoặc toàn phần đều được)
        $vnp_Amount = (int) round($refundAmount * 100);
        $vnp_TxnRef = (string) $paymentTransaction->gateway_reference;
        $vnp_TransactionNo = (string) $paymentTransaction->gateway_transaction_id;
        
        // TransactionDate phải là lúc thanh toán thành công (định dạng YmdHis)
        // Trong CallVnpayRefundCommand.php
        // Thay vì lấy created_at, hãy lấy vnp_PayDate từ JSON đã lưu
        $vnp_TransactionDate = Carbon::createFromFormat(
    'YmdHis',
    $paymentTransaction->gateway_response['vnp_PayDate']
)->format('YmdHis');
        
        $vnp_CreateDate = now()->timezone('Asia/Ho_Chi_Minh')->format('YmdHis');
        $vnp_IpAddr = request()->ip() ?: '127.0.0.1';
        $vnp_OrderInfo = "Hoan tien don hang " . $vnp_TxnRef;
        $vnp_CreateBy = (string) $staffId; // ID của nhân viên thực hiện hoàn tiền

        // Kiểm tra các tham số bắt buộc không được rỗng
        if (blank($vnp_RequestId)) {
            throw new BusinessException('Request ID không được rỗng.');
        }
        if (blank($vnp_Version)) {
            throw new BusinessException('Version không được rỗng.');
        }
        if (blank($vnp_Command)) {
            throw new BusinessException('Command không được rỗng.');
        }
        if (blank($vnp_TmnCode)) {
            throw new BusinessException('TMN Code không được rỗng.');
        }
        if (blank($vnp_TransactionType)) {
            throw new BusinessException('Transaction Type không được rỗng.');
        }
        if (blank($vnp_TxnRef)) {
            throw new BusinessException('TxnRef không được rỗng.');
        }
        if (blank($vnp_Amount) || $vnp_Amount <= 0) {
            throw new BusinessException('Amount phải lớn hơn 0.');
        }
        if (blank($vnp_TransactionNo)) {
            throw new BusinessException('Transaction No không được rỗng.');
        }
        if (blank($vnp_TransactionDate)) {
            throw new BusinessException('Transaction Date không được rỗng.');
        }
        if (blank($vnp_CreateBy)) {
            throw new BusinessException('Create By không được rỗng.');
        }
        if (blank($vnp_CreateDate)) {
            throw new BusinessException('Create Date không được rỗng.');
        }
        if (blank($vnp_IpAddr)) {
            throw new BusinessException('IP Address không được rỗng.');
        }
        if (blank($vnp_OrderInfo)) {
            throw new BusinessException('Order Info không được rỗng.');
        }

        
        // --- BẮT ĐẦU ĐOẠN MOCK ---
        if (env('VNPAY_MOCK_TEST', false)) {
            \Log::info("--- ĐANG CHẠY CHẾ ĐỘ MOCK REFUND (KHÔNG GỌI VNPAY) ---", [
                'txn_ref' => $vnp_TxnRef,
                'amount' => $refundAmount,
                'mocked' => true
            ]);

            // Trả về đúng cấu trúc mà AdminApproveRefundUseCase đang mong đợi
           return [
    'vnp_ResponseId'      => 'MOCK_REF_' . time(),
    'vnp_Command'         => 'refund',
    'vnp_ResponseCode'    => '00', // '00' = thành công
    'vnp_Message'         => 'Mock refund success',
    'vnp_TmnCode'         => $vnp_TmnCode,
    'vnp_TxnRef'          => $vnp_TxnRef,
    'vnp_Amount'          => $vnp_Amount,
    'vnp_BankCode'        => 'MOCKBANK',
    'vnp_PayDate'         => now()->timezone('Asia/Ho_Chi_Minh')->format('YmdHis'),
    'vnp_TransactionNo'   => 'MOCK_VNP_' . random_int(100000, 999999),
    'vnp_TransactionType' => $vnp_TransactionType,
    'vnp_TransactionStatus'=> '00', // giả lập trạng thái thành công
    'vnp_OrderInfo'       => $vnp_OrderInfo,
    'vnp_SecureHash'      => 'MOCK_HASH_' . Str::random(32),
];

        }
        // --- KẾT THÚC ĐOẠN MOCK ---

        // 2. Tạo chuỗi dữ liệu băm theo đúng THỨ TỰ quy định của VNPAY
        // Đảm bảo truyền vnp_TransactionType là '03' nếu hoàn tiền theo số lẻ admin nhập
       /* $dataHash = [
    (string)$vnp_RequestId,      // 1
    (string)$vnp_Version,        // 2
    (string)$vnp_Command,        // 3
    (string)$vnp_TmnCode,        // 4
    (string)$vnp_TransactionType,// 5
    (string)$vnp_TxnRef,         // 6
    (string)$vnp_Amount,         // 7
    (string)$vnp_TransactionNo,  // 8
    (string)$vnp_TransactionDate,// 9
    (string)$vnp_CreateBy,       // 10
    (string)$vnp_CreateDate,     // 11 (Dùng biến đã tạo ở dòng 43)
    (string)$vnp_IpAddr,         // 12 (Dùng biến đã tạo ở dòng 44)
    (string)$vnp_OrderInfo       // 13
];

$hashData = implode('|', $dataHash);
\Log::info("CHUỖI BĂM THỰC TẾ: " . $hashData);
\Log::info([
    'txn_ref' => $vnp_TxnRef,
    'refund_amount' => $refundAmount,
    'vnp_amount' => $vnp_Amount
]);
$vnp_SecureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        // 3. Xây dựng Payload gửi đi
        $payload = [
            "vnp_RequestId"      => $vnp_RequestId,
            "vnp_Version"        => $vnp_Version,
            "vnp_Command"        => $vnp_Command,
            "vnp_TmnCode"        => $vnp_TmnCode,
            "vnp_TransactionType"=> $vnp_TransactionType,
            "vnp_TxnRef"         => $vnp_TxnRef,
            "vnp_Amount"         => $vnp_Amount,
            "vnp_TransactionNo"  => $vnp_TransactionNo,
            "vnp_TransactionDate"=> $vnp_TransactionDate,
            "vnp_CreateBy"       => $vnp_CreateBy,
            "vnp_CreateDate"     => $vnp_CreateDate,
            "vnp_IpAddr"         => $vnp_IpAddr,
            "vnp_OrderInfo"      => $vnp_OrderInfo,
            "vnp_SecureHash"     => $vnp_SecureHash,
        ];

        // 4. Gọi API
        if (str_contains($vnp_ApiUrl, 'sandbox')) {
            $response = Http::withOptions(['verify' => false])->post($vnp_ApiUrl, $payload);
        } else {
            $response = Http::post($vnp_ApiUrl, $payload);
        }
        
        if ($response->failed()) {
            throw new BusinessException("Không thể kết nối đến máy chủ VNPAY.");
        }

        $result = $response->json();

        // 5. Kiểm tra kết quả
        $responseCode = $result['vnp_ResponseCode'] ?? null;

        if ($responseCode !== '00') {
            $errorMsg = $this->getVnpayErrorMessage($responseCode) ?? ($result['vnp_Message'] ?? 'Lỗi hoàn tiền');
            throw new BusinessException("VNPAY từ chối: " . $errorMsg);
        }

        return $result;*/
    }

    private function getVnpayErrorMessage($code) {
        $errors = [
            '91' => 'Không tìm thấy giao dịch yêu cầu hoàn trả.',
            '94' => 'Yêu cầu trùng lặp (RequestId đã tồn tại).',
            '95' => 'Giao dịch này không cho phép hoàn trả.',
            '97' => 'Chữ ký không hợp lệ (Sai HashSecret hoặc sai thứ tự chuỗi băm).',
            '02' => 'Tổng số tiền hoàn lớn hơn số tiền gốc.',
        ];
        return $errors[$code] ?? null;
    }
}