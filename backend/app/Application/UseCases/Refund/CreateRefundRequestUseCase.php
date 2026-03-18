<?php

namespace App\Application\UseCases\Refund;

use App\Models\Ticket;
use App\Models\BookingRequest;
use App\Application\Command\RefundTicket\CalculateRefundAmountCommand;
use App\Application\Command\RefundTicket\CheckRefundEligibilityCommand;
use Illuminate\Support\Facades\DB;

class CreateRefundRequestUseCase
{
    protected $calculateCommand;
    protected $checkRefundCommand;

    public function __construct(
        CalculateRefundAmountCommand $calculateCommand,
        CheckRefundEligibilityCommand $checkRefundCommand
    ) {
        $this->calculateCommand = $calculateCommand;
        $this->checkRefundCommand = $checkRefundCommand;
    }

    public function execute(int $ticketId, string $reason, $user_id): BookingRequest
    {
        // Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
        return DB::transaction(function () use ($ticketId, $reason, $user_id) {
            
            // 1. Lấy vé và khóa dòng (Lock) để tránh bị thao tác song song
            $ticket = Ticket::with(['flightInstance', 'booking'])->lockForUpdate()->findOrFail($ticketId);

            // 2. Kiểm tra điều kiện hoàn (Hàm của bạn sẽ throw Exception nếu lỗi)
            $this->checkRefundCommand->execute($ticket);

            // 3. Tính toán số tiền hoàn thực tế (Bao gồm cả Addons)
            $pricing = $this->calculateCommand->execute($ticket);

            // 4. Tạo bản ghi trong bảng booking_requests
            $refundRequest = BookingRequest::create([
                'ticket_id'     => $ticket->id,
                'booking_id'    => $ticket->booking_id,
                'user_id'       => $user_id, // Người gửi yêu cầu
                'refund_amount' => $pricing['total_refund_amount'],
                'request_type'  => 'REFUND',
                'reason'        => $reason,
                'status'        => 'PENDING', // Trạng thái chờ xử lý
            ]);

            // 5. Cập nhật trạng thái vé sang REFUND_PENDING
            // Điều này ngăn chặn khách hàng nhấn nút Hoàn vé thêm một lần nữa
            $ticket->update([
                'status' => 'REFUND_PENDING'
            ]);
            return $refundRequest;
        });
    }
}