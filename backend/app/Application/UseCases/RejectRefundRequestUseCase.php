<?php

namespace App\Application\UseCases;

use App\Application\Command\AuditLog\CreateAuditLogCommand;
use App\Exceptions\BusinessException;
use App\Models\BookingRequest;

final class RejectRefundRequestUseCase
{
    public function exectute(
        int $staffId,
        int $bookingRequestId,
        string $staffNote
    ) {
        $bookingRequest = BookingRequest::find($bookingRequestId);

        if(!$bookingRequest) throw new BusinessException("Không tìm thấy Booking");

        if ($bookingRequest->status !== 'PENDING') throw new BusinessException("Booking đã được xử lý.");
        if ($bookingRequest->request_type !== 'REFUND')  throw new BusinessException("Booking yêu cầu: " . $bookingRequest->request_type);

        $bookingRequest->update([
            'staff_note' => $staffNote,
            'status' => 'REJECTED'
        ]);

        app(CreateAuditLogCommand::class) -> execute(
            userId: $staffId,
            action: "REJECT_BOOOKING_REQUEST",
            targetTable: 'boooking_requests',
            targetId: $bookingRequest->id
        );

    } 

}