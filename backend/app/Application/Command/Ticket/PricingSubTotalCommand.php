<?php

namespace App\Application\Command\Ticket;

class PricingSubTotalCommand
{
    public function calculate(array $data) {
        $flight = FlightInstance::with('seatInventories')->findOrFail($data['flight_instance_id']);
        $seatInventory = $flight->seatInventories->where('seat_class', $data['seat_class'])->first()OrFail();
        $passengerCount = count($data['passengers']);
        $subtotal = $seatInventory->price * $passengerCount;
        return [
            'subtotal' => $subtotal,
            'currency' => $seatInventory->currency
        ];
    }
}