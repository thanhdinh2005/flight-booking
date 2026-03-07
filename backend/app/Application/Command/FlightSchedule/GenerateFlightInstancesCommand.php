<?php

namespace App\Application\Command\FlightSchedule;

use App\Application\Command\FlightInstance\CreateSeatInventoryCommand;
use App\Exceptions\EntityNotFoundException;
use App\Models\FlightInstance;
use App\Models\FlightSchedule;
use App\Models\Route;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GenerateFlightInstancesCommand
{
    public function execute(int $scheduleId, int $days = 30): void
    {
        $schedule = FlightSchedule::find($scheduleId);

        if (!$schedule) {
            throw new EntityNotFoundException("Schedule not found");
        }

        $route = Route::findOrFail($schedule->route_id);

        $start = now()->startOfDay();
        $end = now()->copy()->addDays($days);

        $daysOfWeek = $schedule->days_of_week;

        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {

            if (!in_array($date->dayOfWeekIso, $daysOfWeek)) {
                continue;
            }

            $exists = FlightInstance::query()
                ->where('flight_schedule_id', $schedule->id)
                ->whereDate('departure_date', $date->toDateString())
                ->exists();

            if ($exists) {
                continue;
            }

            $std = Carbon::parse(
                $date->toDateString().' '.$schedule->departure_time
            );

            $sta = $std->copy()
                ->addMinutes($route->flight_duration_minutes);

            DB::transaction(function () use (
                $schedule,
                $route,
                $date,
                $std,
                $sta
            ) {

                $instance = FlightInstance::create([
                    'flight_schedule_id' => $schedule->id,
                    'route_id' => $schedule->route_id,
                    'aircraft_id' => $schedule->aircraft_id,
                    'flight_number' => $schedule->flight_number,
                    'departure_date' => $date->toDateString(),
                    'std' => $std,
                    'sta' => $sta,
                    'status' => 'SCHEDULED'
                ]);

                app(CreateSeatInventoryCommand::class)
                    ->execute($instance->id);
            });
        }
    }
}