<?php
namespace App\Application\UseCases\Refund;

use App\Models\BookingRequest;
use Illuminate\Support\Facades\DB;
use Exception;

class AdminRejectRefundUseCase
{
    public function execute(int $requestId, int $adminId, string $reason): BookingRequest
    {
        return DB::transaction(function () use ($requestId, $adminId, $reason) {
            
            $request = BookingRequest::lockForUpdate()->findOrFail($requestId);

            if ($request->status !== 'PENDING') {
                throw new Exception("Yêu cầu này đã được xử lý, không thể từ chối.");
            }
            $request->ticket->update(['status' => 'PAID']);
            // Cập nhật trạng thái từ chối
            $request->update([
                'status' => 'REJECTED',
                'staff_id' => $adminId,
                'staff_note' => $reason, // Đây chính là lý do từ chối
                'processed_at' => now(),
            ]);

            // Lưu ý: Khi từ chối, Ticket vẫn giữ nguyên trạng thái cũ (PAID/BOOKED) 
            // và Ghế vẫn giữ nguyên (OCCUPIED) vì khách vẫn sẽ bay tiếp.

            return $request;
        });
    }
}