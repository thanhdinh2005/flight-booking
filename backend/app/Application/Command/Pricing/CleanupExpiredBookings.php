<?php

namespace App\Application\Command\Pricing;

public class CleanupExpiredBookings
{
    public function handle()
{
    // Lấy các booking đã hết hạn nhưng vẫn đang ở trạng thái chờ
    $expiredBookings = Booking::where('status', 'PENDING')
        ->where('expires_at', '<', now())
        ->with('tickets')
        ->get();

    foreach ($expiredBookings as $booking) {
        DB::transaction(function () use ($booking) {
            foreach ($booking->tickets as $ticket) {
                // 1. CỘNG LẠI GHẾ (Rất quan trọng)
                DB::table('flight_seat_inventory')
        ->where('flight_instance_id', $ticket->flight_instance_id)
        ->where('seat_class', $ticket->seat_class) // Ta lấy seat_class từ bảng Ticket
        ->increment('available_seats');
            }

            // 2. Cập nhật trạng thái để ko bị quét lại lần sau
            $booking->update(['status' => 'EXPIRED']);
        });

        $this->info("Đã giải phóng ghế cho PNR: {$booking->pnr}");
    }
}
}