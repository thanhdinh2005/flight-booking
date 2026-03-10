<?php

namespace App\Application\Command\Pricing;

use App\Models\FlightInstance;
use App\Models\Route;

class BasePricingCommand
{
    public function execute(
        FlightInstance $instance,
        string $seatClass
    ) : int {
        $route = Route::find($instance->route_id);

        $duration = $route->flight_duration_minutes;

        $base = $duration * 10000;

        if ($seatClass === 'BUSSINESS') {
            $base *= 2;
        }

        return $base;
    }
}