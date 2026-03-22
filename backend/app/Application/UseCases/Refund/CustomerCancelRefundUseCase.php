<?php

namespace App\Application\UseCases\Refund;

use App\Models\BookingRequest;
use Illuminate\Support\Facades\DB;
use Exception;

class CustomerCancelRefundUseCase
{
    public function execute(int $requestId, int $userId): BookingRequest
    {
        return DB::transaction(function () use ($requestId, $userId) {
            // 1. Tìm request, check đúng chủ sở hữu và load kèm ticket
            $request = BookingRequest::with('ticket')
                ->where('id', $requestId)
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->first();

            if (!$request) {
                throw new Exception("Yêu cầu không tồn tại hoặc bạn không có quyền thực hiện.");
            }

            // 2. Chỉ cho phép hủy khi đang PENDING
            if ($request->status !== 'PENDING') {
                throw new Exception("Yêu cầu đã được xử lý hoặc đã hủy, không thể thực hiện lại.");
            }

            // 3. Mở khóa vé (Trạng thái vé quay về PAID để khách đi bay được)
            if ($request->ticket) {
                $request->ticket->update(['status' => 'PAID']);
            }

            // 4. Cập nhật trạng thái Request thành CANCELLED
            $request->update([
                'status' => 'CANCELLED',
                'processed_at' => now(),
            ]);

            return $request;
        });
    }
}