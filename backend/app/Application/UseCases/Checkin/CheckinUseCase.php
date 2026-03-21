<?php
namespace App\Application\UseCases\Checkin;

use App\Models\Ticket;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Exception;

class CheckinUseCase
{
    public function execute(int $ticketId, string $seatNumber, string $token)
    {
        // 1. Kiểm tra Token trong Cache (Giấy thông hành)
        $cachedToken = Cache::get("checkin_token_{$ticketId}");
        if (!$cachedToken || $cachedToken !== $token) {
            throw new Exception("Phiên xác thực đã hết hạn hoặc không hợp lệ.", 403);
        }

        return DB::transaction(function () use ($ticketId, $seatNumber) {
    // 1. Lock vé và lấy thông tin hạng vé của khách
    $ticket = Ticket::lockForUpdate()->findOrFail($ticketId);
    $userSeatClass = $ticket->seat_class; // Ví dụ: 'ECONOMY'

    // 2. Lấy thông tin thực tế của cái ghế khách vừa chọn
    $targetSeat = \App\Models\AircraftSeat::where('aircraft_id', $ticket->flight_instance->aircraft_id)
        ->where('seat_number', $seatNumber)
        ->first();

    if (!$targetSeat) {
        throw new Exception("Chỗ ngồi không tồn tại trên máy bay này.", 404);
    }

    // 3. KIỂM TRA HẠNG GHẾ (Bảo mật quan trọng)
    if ($targetSeat->seat_class !== $userSeatClass) {
        throw new Exception("Bạn không thể chọn ghế hạng {$targetSeat->seat_class} với vé hạng {$userSeatClass}.", 403);
    }

    // 4. Kiểm tra tranh chấp ghế (như cũ)
    $alreadyTaken = Ticket::where('flight_instance_id', $ticket->flight_instance_id)
        ->where('seat_number', $seatNumber)
        ->where('status', 'CHECKED_IN')
        ->exists();

    if ($alreadyTaken) {
        throw new Exception("Ghế {$seatNumber} vừa có người chọn.", 409);
    }

    // 5. Cập nhật
    $ticket->update([
        'seat_number' => $seatNumber,
        'status' => 'CHECKED_IN',
        'checked_in_at' => now()
    ]);

    Cache::forget("checkin_token_{$ticketId}");

    return $ticket;
});
    }
}