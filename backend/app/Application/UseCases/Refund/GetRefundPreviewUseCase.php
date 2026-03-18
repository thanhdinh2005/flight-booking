<?php

namespace App\Application\UseCases\Refund;

use App\Models\Ticket;
use App\Application\Command\RefundTicket\CalculateRefundAmountCommand;
use App\Application\Command\RefundTicket\CheckRefundEligibilityCommand;

class GetRefundPreviewUseCase
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

    public function execute(int $ticketId): array
    {
        // 1. Kiểm tra vé tồn tại và thuộc quyền sở hữu của User qua bảng bookings
        // Vì bảng tickets không có user_id, ta phải check qua quan hệ 'booking'
        $ticket = Ticket::with(['flightInstance', 'booking'])
            ->where('id', $ticketId)
            ->whereHas('booking', function($query) {
                $query->where('user_id', auth()->id()); // Lấy ID trực tiếp từ Auth
            })
            ->firstOrFail();

        // 2. Kiểm tra điều kiện hoàn (PAID, chưa bay...)
        $this->checkRefundCommand->execute($ticket);

        // 3. Tính toán tiền hoàn trả
        return $this->calculateCommand->execute($ticket);
    }
}