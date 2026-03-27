<?php

namespace App\Application\UseCases\Refund;

use App\Models\Ticket;
use App\Models\BookingRequest;
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
    return DB::transaction(function () use ($ticketId, $reason, $user_id) {
        
        // 1. Lấy vé và khóa dòng
        $ticket = Ticket::with(['booking', 'passenger']) // Load thêm quan hệ để lấy email
            ->where('id', $ticketId)
            ->whereHas('booking', function($q) use ($user_id) {
                $q->where('user_id', $user_id);
            })
            ->lockForUpdate()
            ->first();

        if(!$ticket){
            throw new \Exception("Vé không tồn tại hoặc bạn không có quyền thao tác trên vé này.");
        }

        // 2 & 3. Kiểm tra và tính toán số tiền (Giữ nguyên logic của bạn)
        $this->checkRefundCommand->execute($ticket);
        $pricing = $this->calculateCommand->execute($ticket);

        // 4. Tạo bản ghi yêu cầu hoàn tiền
        $refundRequest = BookingRequest::create([
            'ticket_id'            => $ticket->id,
            'booking_id'           => $ticket->booking_id,
            'user_id'              => $user_id,
            'refund_amount'        => $pricing['total_refund_amount'],
            'system_refund_amount' => $pricing['total_refund_amount'],
            'request_type'         => 'REFUND',
            'reason'               => $reason,
            'status'               => 'PENDING',
        ]);

        // 5. Cập nhật trạng thái vé
        $ticket->update(['status' => 'REFUND_PENDING']);

        // 6. GỬI MAIL XÁC NHẬN TIẾP NHẬN (MỚI)
        // Lấy email từ thông tin liên hệ của Booking
        $contactEmail = $ticket->booking->contact_email;
        
        if ($contactEmail) {
            Mail::to($contactEmail)->queue(new CustomerRequestReceivedMail($refundRequest));
        }

        return $refundRequest;
    });
}
}