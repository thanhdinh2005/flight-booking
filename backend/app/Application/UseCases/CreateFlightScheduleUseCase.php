<?php

namespace App\Application\UseCases;

use App\Exceptions\BusinessException;
use App\Http\Response\ScheduleResponse;
use App\Models\FlightSchedule;
use Illuminate\Support\Facades\DB;

final class CreateFlightScheduleUseCase
{
    public function execute(
        int $route_id,
        string $flight_number,
        string $departure_time,
        array $days_of_week,
        int $aircraft_id
    ): ScheduleResponse {

        return DB::transaction(function () use (
            $route_id,
            $flight_number,
            $departure_time,
            $days_of_week,
            $aircraft_id
        ) {

            $this->ensureNoRouteConflict(
                $route_id,
                $departure_time,
                $days_of_week
            );

            $this->ensureAircraftAvailable(
                $aircraft_id,
                $departure_time,
                $days_of_week
            );

            $schedule = FlightSchedule::create([
                'route_id' => $route_id,
                'flight_number' => $flight_number,
                'departure_time' => $departure_time,
                'days_of_week' => $days_of_week,
                'aircraft_id' => $aircraft_id,
                'is_active' => true
            ]);

            return ScheduleResponse::fromModel($schedule);
        });
    }

    private function ensureNoRouteConflict(
        int $routeId,
        string $time,
        array $days
    ): void {

        $schedules = FlightSchedule::sameRouteAndTime($routeId, $time)->get();

        foreach ($schedules as $schedule) {

            if (array_intersect($schedule->days_of_week, $days)) {
                throw new BusinessException(
                    'Schedule conflict: route already has flight at this time'
                );
            }
        }
    }

    private function ensureAircraftAvailable(
        int $aircraftId,
        string $time,
        array $days
    ): void {

        $schedules = FlightSchedule::sameAircraftAndTime($aircraftId, $time)->get();

        foreach ($schedules as $schedule) {

            if (array_intersect($schedule->days_of_week, $days)) {
                throw new BusinessException(
                    'Aircraft already assigned at this time'
                );
            }
        }
    }
}