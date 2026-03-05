<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuditLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = DB::table('users')->first();
        $booking = DB::table('bookings')->first();

        DB::table('audit_logs')->insert([
            'user_id' => $user->id,
            'action' => 'CREATE_BOOKING',
            'target_table' => 'bookings',
            'target_id' => $booking->id,
            'changes' => json_encode(['status' => 'CONFIRMED']),
            'ip_address' => '127.0.0.1',
            'created_at' => now(),
        ]);
    }
}
