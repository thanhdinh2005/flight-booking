<?php

namespace App\Http\Response;

use App\Models\FlightSchedule;

final class ScheduleResponse 
{
public function __construct(
        public int $id,
        public int $route_id,
        public string $flight_number,
        public string $departure_time,
        public array $days_of_week,
        public int $aircraft_id,
        public bool $is_active,
        public string $created_at,
        public string $updated_at,
    ) {}

    public static function fromModel(FlightSchedule $schedule): self
    {
        return new self(
            id: $schedule->id,
            route_id: $schedule->route_id,
            flight_number: $schedule->flight_number,
            departure_time: $schedule->departure_time,
            days_of_week: $schedule->days_of_week,
            aircraft_id: $schedule->aircraft_id,
            is_active: $schedule->is_active,
            created_at: $schedule->created_at->toIso8601String(),
            updated_at: $schedule->updated_at->toIso8601String(),
        );
    }
}