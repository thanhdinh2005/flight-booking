<?php

namespace App\Http\Response;

use App\Models\FlightInstance;

final readonly class FlightResponse
{
    public function __construct(
        public int $id,
        public ?int $flight_schedule_id,
        public int $route_id,
        public int $aircraft_id,
        public string $flight_number,
        public string $departure_date,
        public string $std,
        public string $sta,
        public string $status,
    ) {}

    public static function fromModel(FlightInstance $flight): self
    {
        return new self(
            id: $flight->id,
            flight_schedule_id: $flight->flight_schedule_id,
            route_id: $flight->route_id,
            aircraft_id: $flight->aircraft_id,
            flight_number: $flight->flight_number,
            departure_date: $flight->departure_date,
            std: $flight->std->toIso8601String(),
            sta: $flight->sta->toIso8601String(),
            status: $flight->status,
        );
    }
}