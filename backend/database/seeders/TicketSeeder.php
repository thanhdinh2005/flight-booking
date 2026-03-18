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
        // Lấy danh sách ID để tham chiếu
        $bookingIds = DB::table('bookings')->pluck('id')->toArray();
        $flightIds = DB::table('flight_instances')->pluck('id')->toArray();
        $passengerIds = DB::table('passengers')->pluck('id')->toArray();

        if (empty($bookingIds) || empty($flightIds) || empty($passengerIds)) {
            return;
        }

        // Mỗi hành khách trong hệ thống sẽ được cấp 1 vé tương ứng
        foreach ($passengerIds as $index => $pId) {
            
            DB::table('tickets')->insert([
                'booking_id'         => $bookingIds[$index % count($bookingIds)], 
                'flight_instance_id' => $flightIds[$index % count($flightIds)],
                'passenger_id'       => $pId, 
                'seat_class'         => 'ECONOMY',
                'seat_number'        => null, // ĐỂ NULL: Khách sẽ chọn khi Check-in online
                'ticket_price'       => 1200000,
                'status'             => 'ACTIVE',
                'created_at'         => now(),
                'updated_at'         => now(),
            ]);
        }
    }
}