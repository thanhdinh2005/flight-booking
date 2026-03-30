<?php

namespace App\Application\Command\FlightSchedule;

use App\Application\Command\SeatInventory\CreateSeatInventoryCommand as SeatInventoryCreateSeatInventoryCommand;
use App\Exceptions\BusinessException;
use App\Exceptions\EntityNotFoundException;
use App\Models\Aircraft;
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

        $aircraft = Aircraft::findOrFail($schedule->aircraft_id);

        if ($aircraft->status === 'MAINTENANCE') {
            throw new BusinessException("Aircraft is under maintenance");
        }

        if (!$route->flight_duration_minutes) {
            throw new BusinessException("Invalid route duration");
        }

        $lastFlight = FlightInstance::where('flight_schedule_id', $schedule->id)
            ->orderByDesc('departure_date')
            ->first();

        $start = $lastFlight
            ? Carbon::parse($lastFlight->departure_date)->addDay()
            : now()->startOfDay();

        $end = now()->copy()->addDays($days);

        $daysOfWeek = $schedule->days_of_week;

        DB::transaction(function () use (
            $schedule,
            $route,
            $start,
            $end,
            $daysOfWeek
        ) {

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
                    $date->toDateString() . ' ' . $schedule->departure_time,
                    'Asia/Ho_Chi_Minh'
                );

                $sta = $std->copy()
                    ->addMinutes($route->flight_duration_minutes);

                $instance = FlightInstance::create([
                    'flight_schedule_id' => $schedule->id,
                    'route_id' => $schedule->route_id,
                    'aircraft_id' => $schedule->aircraft_id,
                    'departure_date' => $date->toDateString(),
                    'std' => $std,
                    'sta' => $sta,
                    'status' => 'SCHEDULED'
                ]);

                app(SeatInventoryCreateSeatInventoryCommand::class)
                    ->execute($instance->id);
            }

        });
    }
}