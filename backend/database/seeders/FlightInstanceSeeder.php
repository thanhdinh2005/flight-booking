<?php

namespace Database\Seeders;

use App\Application\Command\FlightSchedule\GenerateFlightInstancesCommand;
use App\Models\FlightSchedule;
use Illuminate\Database\Seeder;


class FlightInstanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schedules = FlightSchedule::all();

        foreach ($schedules as $schedule) {
            app(GenerateFlightInstancesCommand::class)
                ->execute($schedule->id, 10);
        }
    }
}
