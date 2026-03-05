<?php

namespace App\Application\UseCases;

use App\Http\Response\ScheduleResponse;
use App\Models\FlightSchedule;
use Illuminate\Support\Facades\DB;
use Throwable;

final class CreateFlightScheduleUseCase
{
    public function execute(
        int $route_id,
        string $flight_number,
        string $departure_time,
        array $days_of_week,
        int $aircraft_id,
    ): ScheduleResponse {
        DB::beginTransaction();

        try {
            $schedule = FlightSchedule::create([
                'route_id' => $route_id,
                'flight_number' => $flight_number,
                'departure_time' => $departure_time,
                'days_of_week' => $days_of_week,
                'aircraft_id' => $aircraft_id,
                'is_active' => true
            ]);

            DB::commit();
            return ScheduleResponse::fromModel($schedule);
        } catch (Throwable $e){
            DB::rollBack();
            throw $e;
        }
    }
}