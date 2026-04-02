<?php

namespace App\Application\UseCases\Refund;

use App\Models\Ticket;
use App\Models\BookingRequest;
use App\Enums\Booking\RequestStatus;
use App\Enums\Booking\TicketStatus;
use App\Application\Command\RefundTicket\CalculateRefundAmountCommand;
use App\Application\Command\RefundTicket\CheckRefundEligibilityCommand;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\CustomerRequestReceivedMail;
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
    $refundRequest = DB::transaction(function () use ($ticketId, $reason, $user_id) {
        
        // 1. Kiểm tra tồn tại & Quyền sở hữu
        $ticket = Ticket::with(['booking', 'passenger'])
            ->where('id', $ticketId)
            ->lockForUpdate() // Khóa để tránh 2 request hoàn tiền cùng lúc
            ->first();

        if (!$ticket || $ticket->booking->user_id !== $user_id) {
            throw new \App\Exceptions\EntityNotFoundException("Vé không tồn tại hoặc bạn không có quyền.");
        }

        // 2. Kiểm tra trạng thái hiện tại của vé
        if (in_array($ticket->status, [TicketStatus::REFUND_PENDING, TicketStatus::REFUNDED], true)) {
            throw new \InvalidArgumentException("Vé này đã được gửi yêu cầu hoàn hoặc đã hoàn tất.");
        }

        // 3. Logic Command (Nên bao bọc trong try-catch nếu cần báo lỗi chi tiết)
        try {
            $this->checkRefundCommand->execute($ticket);
            $pricing = $this->calculateCommand->execute($ticket);
        } catch (\Exception $e) {
            // Re-throw để Transaction tự rollback
            throw new \Exception("Yêu cầu không thỏa mãn điều kiện: " . $e->getMessage());
        }

        // 4. Tạo yêu cầu
        $refundRequest = BookingRequest::create([
            'ticket_id'            => $ticket->id,
            'booking_id'           => $ticket->booking_id,
            'user_id'              => $user_id,
            'refund_amount'        => $pricing['total_refund_amount'] ?? 0,
            'system_refund_amount' => $pricing['total_refund_amount'] ?? 0,
            'request_type'         => 'REFUND',
            'reason'               => $reason,
            'status'               => RequestStatus::PENDING,
        ]);

        $ticket->update(['status' => TicketStatus::REFUND_PENDING]);

        return $refundRequest;
    });

    // SỬA TẠI ĐÂY: 
    // Vì $ticket bên trên đã "chết" sau khi thoát Transaction, 
    // ta dùng $refundRequest->ticket để lấy lại nó (nhờ quan hệ ticket() trong model)
    if ($refundRequest) {
        $this->sendConfirmationMail($refundRequest->ticket, $refundRequest);
    }

    return $refundRequest;
}

private function sendConfirmationMail($ticket, $refundRequest) {
    try {
        $contactEmail = $ticket->booking->contact_email ?? null;
        if ($contactEmail) {
            Mail::to($contactEmail)->queue(new CustomerRequestReceivedMail($refundRequest));
        }
    } catch (\Exception $e) {
        // Chỉ log lỗi, không throw để user nhận được kết quả success trên màn hình
        \Illuminate\Support\Facades\Log::error("Mail error: " . $e->getMessage());
    }
}
}
