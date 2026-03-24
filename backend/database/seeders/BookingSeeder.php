<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Enums\Booking\BookingStatus;
class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = DB::table('users')->first();
        $flights = DB::table('flight_instances')->take(3)->get();

        foreach ($flights as $index => $flight) {
    DB::table('bookings')->insert([
        'user_id' => $user->id,
        'pnr' => strtoupper(Str::random(6)),
        'total_amount' => 1200000,
        'status' => ($index == 0) ? BookingStatus::PAID->value : BookingStatus::PENDING->value,
        'contact_email' => $user->email,
        'contact_phone' => '0900000000',
        'expires_at' => ($index == 0) ? null : now()->addMinutes(30), // PENDING thì có hạn thanh toán
        'created_at' => now(),
    ]);
}
    }
}
