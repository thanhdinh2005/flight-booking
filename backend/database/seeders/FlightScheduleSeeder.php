<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\FlightSchedule;

class FlightScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $routes = DB::table('routes')->get();
        $aircraft = DB::table('aircrafts')->first();

        $times = ['06:00:00','08:00:00','10:00:00','13:00:00','16:00:00','20:00:00'];

        foreach ($routes as $route) {

            for ($i = 0; $i < 2; $i++) {

                FlightSchedule::create([
                    'route_id' => $route->id,
                    'flight_number' => 'VN' . rand(100,999),
                    'departure_time' => $times[array_rand($times)],
                    'days_of_week' => collect(range(1,7))
                        ->shuffle()
                        ->take(rand(3,7))
                        ->values()
                        ->toArray(),
                    'aircraft_id' => $aircraft->id,
                    'is_active' => true,
                ]);
            }
        }
    }
}
