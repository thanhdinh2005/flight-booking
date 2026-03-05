<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BookingRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $booking = DB::table('bookings')->first();
        $user = DB::table('users')->first();

        DB::table('booking_requests')->insert([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'request_type' => 'CHANGE_FLIGHT',
            'reason' => 'Need to reschedule',
            'status' => 'PENDING',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
