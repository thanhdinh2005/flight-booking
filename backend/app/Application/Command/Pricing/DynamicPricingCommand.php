<?php

namespace App\Application\Command\Pricing;

use App\Models\FlightSeatInventory;

use function Symfony\Component\Clock\now;

class DynamicPricingCommand
{
    public function execute(
        FlightSeatInventory $inventory
    ) : float {
        $price = $inventory->price;

        $flight = $inventory->flightInstance;

        $loadFactor = 1- ($inventory->available_seats / $inventory->total_seats);

        if ($loadFactor > 0.7) {
            $price *= 1.3;
        }

        $days = now()->diffInDays($flight->departure_date);

        if ($days <= 3) {
            $price *= 1.5;
        }
        elseif ($days <= 7) {
            $price *= 1.25;
        }
        elseif ($days <= 30) {
            $price *= 1.1;
        }

        return $price;
    }
}