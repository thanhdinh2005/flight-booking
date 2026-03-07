<?php

namespace App\Application\Command\FlightSchedule;

use App\Exceptions\EntityNotFoundException;
use App\Models\FlightSchedule;

final class ReactiveFlightScheduleCommand
{
    public function execute(int $scheduleId) : FlightSchedule {
        $schedule = FlightSchedule::find($scheduleId);

        if (!$schedule) throw new EntityNotFoundException("Flight schedule not found!");

        if ($schedule->is_active) {
            return $schedule;
        }

        $schedule->update(['is_active' => true]);
        return $schedule;
    }
}