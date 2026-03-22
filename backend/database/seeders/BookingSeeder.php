<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = DB::table('users')->first();
        $flights = DB::table('flight_instances')->take(3)->get();

        foreach ($flights as $flight) {

            DB::table('bookings')->insert([
                'user_id' => $user->id,
                'pnr' => strtoupper(Str::random(6)),
                'total_amount' => 1200000,
                'status' => 'PAID',
                'contact_email' => $user->email,
                'contact_phone' => '0900000000',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
