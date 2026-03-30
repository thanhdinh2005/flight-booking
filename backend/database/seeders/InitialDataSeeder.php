<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Enums\SystemStatus; // Import Enum để dùng giá trị chuẩn
class InitialDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {

            $airports = [
                ['code' => 'HAN', 'name' => 'Noi Bai International Airport', 'city' => 'Ha Noi', 'status' => true],
                ['code' => 'SGN', 'name' => 'Tan Son Nhat International Airport', 'city' => 'Ho Chi Minh City', 'status' => true],
                ['code' => 'DAD', 'name' => 'Da Nang International Airport', 'city' => 'Da Nang', 'status' => true],
                ['code' => 'PXU', 'name' => 'Pleiku Airport', 'city' => 'Gia Lai', 'status' => true],
            ];

            foreach ($airports as $airport) {
                DB::table('airports')->updateOrInsert(
                    ['code' => $airport['code']],
                    $airport
                );
            }

            $airportIds = DB::table('airports')->pluck('id', 'code');

            $aircrafts = [
                [
                    'model' => 'Airbus A321',
                    'registration_number' => 'VN-A392',
                    'total_economy_seats' => 150,
                    'total_business_seats' => 16,
                    'status' => SystemStatus::ACTIVE->value,
                ],
                [
                    'model' => 'Boeing 787-9',
                    'registration_number' => 'VN-A867',
                    'total_economy_seats' => 250,
                    'total_business_seats' => 28,
                    'status' => SystemStatus::ACTIVE->value,
                ],
            ];

            foreach ($aircrafts as $aircraft) {
                DB::table('aircrafts')->updateOrInsert(
                    ['registration_number' => $aircraft['registration_number']],
                    $aircraft
                );
            }

            $routes = [];

            foreach ($airportIds as $originCode => $originId) {
                foreach ($airportIds as $destinationCode => $destinationId) {

                    if ($originId === $destinationId) {
                        continue;
                    }

                    $duration = match ([$originCode, $destinationCode]) {
                        ['HAN', 'SGN'], ['SGN', 'HAN'] => 120,
                        ['HAN', 'DAD'], ['DAD', 'HAN'] => 80,
                        ['SGN', 'DAD'], ['DAD', 'SGN'] => 90,
                        default => 60,
                    };

                    $routes[] = [
                        'origin_airport_id' => $originId,
                        'destination_airport_id' => $destinationId,
                        'flight_duration_minutes' => $duration,
                    ];
                }
            }

            foreach ($routes as $route) {
                DB::table('routes')->updateOrInsert(
                    [
                        'origin_airport_id' => $route['origin_airport_id'],
                        'destination_airport_id' => $route['destination_airport_id'],
                    ],
                    $route
                );
            }
        });
    }
}