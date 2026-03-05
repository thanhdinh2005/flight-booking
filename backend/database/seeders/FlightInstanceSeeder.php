<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class FlightInstanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schedules = DB::table('flight_schedules')->get();

        foreach ($schedules as $schedule) {

            $route = DB::table('routes')->where('id', $schedule->route_id)->first();

            for ($i = 1; $i <= 5; $i++) {

                $date = Carbon::today()->addDays($i);
                $std = $date->copy()->setTimeFromTimeString($schedule->departure_time);
                $sta = $std->copy()->addMinutes($route->flight_duration_minutes);

                DB::table('flight_instances')->insert([
                    'flight_schedule_id' => $schedule->id,
                    'route_id' => $route->id,
                    'aircraft_id' => $schedule->aircraft_id,
                    'flight_number' => $schedule->flight_number,
                    'departure_date' => $date,
                    'std' => $std,
                    'sta' => $sta,
                    'status' => 'SCHEDULED',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
