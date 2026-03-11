<?php

namespace App\Application\Command\Refund;

class UpdateRefundStateCommand
{
    public function execute($refundRequest, $booking, $tickets, $staffNote)
    {
        // 1. Cập nhật Request
        $refundRequest->update([
            'status' => 'APPROVED',
            'staff_note' => $staffNote
        ]);

        // 2. Cập nhật Booking
        $booking->update(['status' => 'REFUNDED']);

        // 3. Cập nhật Tickets
        foreach ($tickets as $ticket) {
            $ticket->update(['status' => 'REFUNDED']);
        }
    }
}