<?php

namespace App\Application\UseCases;

use App\Application\Command\BookingRequest\CreateBookingRequestCommand;
use App\Exceptions\BusinessException;
use App\Exceptions\EntityNotFoundException;
use App\Models\Booking;
use App\Models\BookingRequest;

final class RequestBookingRefundUseCase
{
    public function __construct(
        private CreateBookingRequestCommand $cmd,
    )
    {}

    public function execute(
        int $booking_id,
        int $user_id,
        string $reason,
    ): BookingRequest {
        $booking = Booking::where('id', $booking_id)
            ->where('user_id', $user_id)
            ->first();

        if(!$booking) throw new EntityNotFoundException("Không tìm thấy đơn đặt chỗ hợp lệ.");
        if ($booking->status !== "CONFIRMED") {
            throw new BusinessException('Chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã thanh toán thành công.');
        }

        $hasPendingRequest = BookingRequest::where('booking_id', $booking->id)
            ->where('status', 'PENDING')
            ->exists();

        if ($hasPendingRequest) {
            throw new BusinessException("Yêu cầu đang được xử lý. Vui lòng không gửi lại.");
        }

        return $this->cmd->execute(
            bookingId: $booking->id,
            userId: $booking->user_id,
            requestType: 'REFUND',
            reason: $reason
        );
    }
}