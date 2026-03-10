<?php

namespace App\Console\Commands;

use App\Application\Command\FlightSchedule\GenerateFlightInstancesCommand;
use App\Models\FlightSchedule;
use Illuminate\Console\Command;

class GenerateMonthlyFlights extends Command
{

    protected $signature = 'generate-monthly-flights';

    protected $description = 'Generate flight instances util end of month';

    public function __construct(
        private GenerateFlightInstancesCommand $generator
    )
    {
        return parent::__construct();
    }

    public function handle(): void
    {
        $schedules = FlightSchedule::where('is_active', true)->get();

        foreach ($schedules as $schedule) {

            try {

                $this->generator->execute($schedule->id, 31);

                $this->info("Generated flights for schedule {$schedule->id}");

            } catch (\Throwable $e) {

                $this->error("Failed schedule {$schedule->id}: ".$e->getMessage());

            }

        }

        $this->info('Flight generation finished.');
    }
}
