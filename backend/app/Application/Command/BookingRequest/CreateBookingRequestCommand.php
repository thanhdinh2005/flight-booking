<?php

namespace App\Application\Command\BookingRequest;

use App\Models\BookingRequest;

class CreateBookingRequestCommand
{
    public function execute(
        int $bookingId,
        int $userId,
        string $requestType,
        string $reason
    ) : BookingRequest{
        return BookingRequest::create([
            'booking_id'   => $bookingId,
            'user_id'      => $userId,
            'request_type' => $requestType,
            'reason'       => $reason,
            'status'       => 'PENDING',
        ]);
    }
}