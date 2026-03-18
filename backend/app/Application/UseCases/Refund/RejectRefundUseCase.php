<?php

namespace App\Application\UseCases\Refund;

use App\Models\BookingRequest;
use App\Models\Ticket;
use App\Application\Command\RefundTicket\CalculateRefundAmountCommand;
use App\Application\Command\RefundTicket\CheckRefundEligibilityCommand;
use Illuminate\Support\Facades\DB;

class RejectRefundUseCase{

    public function execute(int $requestId, string $staffNote)
    {
        return DB::transaction(function () use ($requestId, $staffNote) {
            // 1. Tìm yêu cầu hoàn tiền
            $request = BookingRequest::findOrFail($requestId);

            // Kiểm tra trạng thái: Chỉ được từ chối khi đơn đang ở trạng thái PENDING
            if ($request->status !== 'PENDING') {
                throw new \Exception("Yêu cầu này không còn ở trạng thái chờ duyệt.");
            }

            // 2. Tìm vé liên quan
            $ticket = Ticket::findOrFail($request->ticket_id);

            // 3. CẬP NHẬT TICKET: Trả về trạng thái PAID ban đầu
            // Để khách có thể làm thủ tục bay (Check-in) bình thường
            $ticket->update([
                'status' => 'PAID'
            ]);

            // 4. CẬP NHẬT REQUEST: Chuyển sang REJECTED
            $request->update([
                'status' => 'REJECTED',
                'staff_id' => auth()->id(), // Người từ chối
                'staff_note' => $staffNote,  // Lý do từ chối (Gửi cho khách xem)
                'processed_at' => now()
            ]);

            // Lưu ý: Chúng ta GIỮ NGUYÊN số tiền trong bảng Booking vì lúc gửi đơn ta chưa trừ tiền.

            return $request;
        });
    }
}