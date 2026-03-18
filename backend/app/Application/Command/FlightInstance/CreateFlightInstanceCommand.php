<?php

namespace App\Application\Command\FlightInstance;

use App\Models\FlightInstance;
use App\Models\Route;
use Illuminate\Support\Carbon;

class CreateFlightInstanceCommand
{
    public function execute(
        int $routeId,
        int $aircraftId,
        string $flightNumber,
        Carbon $departure,
        ?int $scheduleId = null
    ): FlightInstance {

        $route = Route::findOrFail($routeId);

        $instance = FlightInstance::create([
            'flight_schedule_id' => $scheduleId,
            'route_id' => $routeId,
            'aircraft_id' => $aircraftId,
            'flight_number' => $flightNumber,
            'departure_date' => $departure->toDateString(),
            'std' => $departure,
            'sta' => $departure->copy()->addMinutes($route->flight_duration_minutes),
            'etd' => $departure,
            'eta' => $departure->copy()->addMinutes($route->flight_duration_minutes),
            'status' => 'SCHEDULED'
        ]);

        return $instance;
    }
}