<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bookings = DB::table('bookings')->get();

        foreach ($bookings as $booking) {

            DB::table('transactions')->insert([
                'booking_id' => $booking->id,
                'amount' => $booking->total_amount,
                'type' => 'PAYMENT',
                'payment_method' => 'VNPAY',
                'gateway_transaction_id' => Str::uuid(),
                'status' => 'SUCCESS',
                'created_at' => now(),
            ]);
        }
    }
}
