<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Enums\Booking\TicketStatus;
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
    $booking = DB::table('bookings')->find($bookingIds[$index % count($bookingIds)]);
    
    DB::table('tickets')->insert([
        'booking_id'         => $booking->id,
        'flight_instance_id' => $flightIds[0],
        'passenger_id'       => $pId,
        'seat_class'         => 'ECONOMY',
        'ticket_price'       => 1200000,
        // Nếu booking chưa trả tiền, vé phải ở trạng thái chờ (ví dụ: RESERVED hoặc PENDING)
        'status'             => ($booking->status === 'PAID') ? TicketStatus::ACTIVE->value : 'PENDING',
        'created_at'         => now(),
    ]);
}
    }
}