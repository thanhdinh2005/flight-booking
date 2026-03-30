<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\FlightSchedule;
use Illuminate\Support\Str;

class FlightScheduleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $routes = DB::table('routes')->get();
        $aircrafts = DB::table('aircrafts')->get();

        $times = ['06:00:00','08:00:00','10:00:00','13:00:00','16:00:00','20:00:00'];

        foreach ($routes as $route) {

            for ($i = 0; $i < 2; $i++) {

                FlightSchedule::create([
                    'route_id' => $route->id,
                    'flight_number' => 'VN' . strtoupper(Str::random(4)),
                    'departure_time' => $times[array_rand($times)],
                    'days_of_week' => collect(range(1,7))
                        ->shuffle()
                        ->take(rand(3,7))
                        ->values()
                        ->toArray(),
                    'aircraft_id' => $aircrafts->random()->id,
                    'is_active' => true,
                ]);
            }
        }
    }
}
