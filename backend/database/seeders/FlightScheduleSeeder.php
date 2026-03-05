<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FlightScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $routes = DB::table('routes')->get();
        $aircraft = DB::table('aircrafts')->first();

        foreach ($routes as $route) {
            DB::table('flight_schedules')->insert([
                'route_id' => $route->id,
                'flight_number' => 'VN' . rand(100, 999),
                'departure_time' => '08:00:00',
                'days_of_week' => '1,2,3,4,5,6,7',
                'aircraft_id' => $aircraft->id,
                'is_active' => true,
            ]);
        }
    }
}
