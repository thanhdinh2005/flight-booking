<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Enums\Booking\BookingStatus;
use App\Enums\Booking\TicketStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CancelExpiredBookingsCommand extends Command
{
    // Lệnh chạy: php artisan booking:cancel-expired
    protected $signature = 'booking:cancel-expired';
    protected $description = 'Tự động hủy các đơn hàng đã quá hạn expires_at';

    public function handle()
    {
        $now = Carbon::now();

        // 1. Tìm các booking PENDING đã hết hạn
        $expiredBookings = Booking::with(['tickets', 'tickets.flight_instance'])
            ->where('status', BookingStatus::PENDING->value)
            ->where('expires_at', '<', $now)
            ->get();

        if ($expiredBookings->isEmpty()) {
            $this->info('Không có booking nào hết hạn.');
            return;
        }

        foreach ($expiredBookings as $booking) {
            $this->info("Đang xử lý booking ID {$booking->id} (user_id: {$booking->user_id}, expires_at: {$booking->expires_at})...");
            try {
                DB::transaction(function () use ($booking) {
                    // 2. Cập nhật trạng thái Booking sang CANCELLED
                    $booking->update([
                        'status' => BookingStatus::CANCELLED->value
                    ]);

                    // 3. Cập nhật các vé liên quan (nếu có)
                    foreach ($booking->tickets as $ticket) {
                        $ticket->update(['status' => TicketStatus::CANCELLED->value]);
                        
                        // 4. QUAN TRỌNG: Trả lại ghế vào kho (Inventory)
                        $this->restoreSeat($ticket);
                    }

                    Log::info("Booking ID {$booking->id} đã bị hủy tự động do hết hạn thanh toán.");
                });
                $this->info("Xong booking ID {$booking->id}.");
            } catch (\Exception $e) {
                Log::error("Lỗi khi hủy booking {$booking->id}: " . $e->getMessage());
                $this->error("Lỗi khi xử lý booking ID {$booking->id}: " . $e->getMessage());
            }
        }

        $this->info('Đã xử lý xong ' . $expiredBookings->count() . ' đơn hàng.');
    }

    /**
     * Hoàn lại chỗ vào kho ghế (giống logic bên Refund)
     */
    private function restoreSeat($ticket)
    {
        $inventory = \App\Models\FlightSeatInventory::where('flight_instance_id', $ticket->flight_instance_id)
            ->where('seat_class', $ticket->seat_class)
            ->first();

        if ($inventory) {
            $inventory->increment('available_seats');
        }
    }
}