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

    public function execute(int $ticketId, int $userId): array
    {
        // 1. Kiểm tra vé tồn tại và thuộc quyền sở hữu của User qua bảng bookings
        // Vì bảng tickets không có user_id, ta phải check qua quan hệ 'booking'
        $ticket = Ticket::with(['flight_instance', 'booking'])
            ->where('id', $ticketId)
            // IMPORTANT: Phải có 'use ($userId)' để truyền biến từ hàm execute vào scope của closure.
            // Trong PHP, anonymous functions không tự động nhận biến từ phạm vi bên ngoài.
            ->whereHas('booking', function($query) use ($userId){
                $query->where('user_id', $userId); // Lấy ID trực tiếp từ Auth
            })
            ->firstOrFail();

        // 2. Kiểm tra điều kiện hoàn (PAID, chưa bay...)
        $this->checkRefundCommand->execute($ticket);

        // 3. Tính toán tiền hoàn trả
        return $this->calculateCommand->execute($ticket);
    }
}