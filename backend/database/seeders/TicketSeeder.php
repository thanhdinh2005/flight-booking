<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bookings = DB::table('bookings')->get();
        $flights = DB::table('flight_instances')->get();

        foreach ($bookings as $index => $booking) {

            DB::table('tickets')->insert([
                'booking_id' => $booking->id,
                'flight_instance_id' => $flights[$index]->id,
                'passenger_name' => 'Passenger Test',
                'seat_class' => 'ECONOMY',
                'ticket_price' => 1200000,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
