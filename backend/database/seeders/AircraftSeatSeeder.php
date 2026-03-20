<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AircraftSeatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
{
    $aircrafts = \App\Models\Aircraft::all();

    foreach ($aircrafts as $aircraft) {
        $seats = [];
        
        // 1. Sinh ghế Business (Bắt đầu từ hàng 1)
        $bizRows = ceil($aircraft->total_business_seats / 4);
        for ($i = 1; $i <= $bizRows; $i++) {
            foreach (['A', 'C', 'D', 'F'] as $letter) {
                if (count($seats) < $aircraft->total_business_seats) {
                    $seats[] = [
                        'aircraft_id' => $aircraft->id,
                        'seat_number' => $i . $letter,
                        'seat_class'  => 'BUSINESS',
                        'is_active'   => true,
                        'created_at'  => now()
                    ];
                }
            }
        }

        // 2. Sinh ghế Economy (Tiếp nối sau hàng Business)
        $ecoRows = ceil($aircraft->total_economy_seats / 6);
        $startEcoRow = $bizRows + 1;
        $ecoCount = 0;
        for ($i = $startEcoRow; $i < ($startEcoRow + $ecoRows); $i++) {
            foreach (['A', 'B', 'C', 'D', 'E', 'F'] as $letter) {
                if ($ecoCount < $aircraft->total_economy_seats) {
                    $seats[] = [
                        'aircraft_id' => $aircraft->id,
                        'seat_number' => $i . $letter,
                        'seat_class'  => 'ECONOMY',
                        'is_active'   => true,
                        'created_at'  => now()
                    ];
                    $ecoCount++;
                }
            }
        }

        // Dùng chunk để insert nếu máy bay quá lớn (ví dụ A380)
        collect($seats)->chunk(100)->each(function($chunk) {
            \App\Models\AircraftSeat::insert($chunk->toArray());
        });
    }
}
}
