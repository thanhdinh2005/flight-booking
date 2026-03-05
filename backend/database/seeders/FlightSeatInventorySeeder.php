<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FlightSeatInventorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $flights = DB::table('flight_instances')->get();

        foreach ($flights as $flight) {

            $aircraft = DB::table('aircrafts')->where('id', $flight->aircraft_id)->first();

            DB::table('flight_seat_inventory')->insert([
                [
                    'flight_instance_id' => $flight->id,
                    'seat_class' => 'ECONOMY',
                    'total_seats' => $aircraft->total_economy_seats,
                    'available_seats' => $aircraft->total_economy_seats,
                    'price' => rand(1000000, 1500000),
                    'currency' => 'VND',
                ],
                [
                    'flight_instance_id' => $flight->id,
                    'seat_class' => 'BUSINESS',
                    'total_seats' => $aircraft->total_business_seats,
                    'available_seats' => $aircraft->total_business_seats,
                    'price' => rand(3000000, 5000000),
                    'currency' => 'VND',
                ],
            ]);
        }
    }
}
