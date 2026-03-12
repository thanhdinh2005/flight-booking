<?php

namespace App\Application\Command\Refund;

use App\Models\FlightSeatInventory;

class RestoreFlightSeatsCommand
{
    public function execute($tickets)
    {
        // Lặp qua từng vé và trả lại ghế vào inventory tương ứng
        foreach ($tickets as $ticket) {
            FlightSeatInventory::where('flight_instance_id', $ticket->flight_instance_id)
                ->where('seat_class', $ticket->seat_class)
                ->increment('available_seats', 1);
        }
    }
}