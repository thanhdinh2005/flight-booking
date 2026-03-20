<?php
namespace App\Application\UseCases\Checkin;
use App\Models\Ticket;
use Exception;
use Illuminate\Support\Facades\DB;

class CheckinUseCase
{
    public function execute(int $ticketId, string $seatNumber)
{
    return DB::transaction(function () use ($ticketId, $seatNumber) {
        // 1. Lock vé để tránh sửa đổi đồng thời
        $ticket = Ticket::with('flight_instance.aircraft')->lockForUpdate()->findOrFail($ticketId);

        // 2. Kiểm tra trạng thái vé
        if (!in_array($ticket->status, ['PAID', 'ISSUED', 'CHECKED_IN'])) {
            throw new Exception("Trạng thái vé không hợp lệ để làm thủ tục.");
        }

        // 3. [MỚI] Kiểm tra xem số ghế có hợp lệ với loại máy bay và HẠNG VÉ không
        $isValidSeat = \App\Models\AircraftSeat::where('aircraft_id', $ticket->flight_instance->aircraft_id)
            ->where('seat_number', $seatNumber)
            ->where('seat_class', $ticket->seat_class) // Đảm bảo đúng hạng Business/Economy
            ->where('is_active', true)
            ->exists();

        if (!$isValidSeat) {
            throw new Exception("Ghế $seatNumber không tồn tại, không đúng hạng vé hoặc đang bảo trì.");
        }

        // 4. Kiểm tra trùng ghế (Loại trừ chính nó để cho phép đổi ghế)
        $isOccupied = Ticket::where('flight_instance_id', $ticket->flight_instance_id)
            ->where('seat_number', $seatNumber)
            ->where('status', 'CHECKED_IN')
            ->where('id', '!=', $ticketId) 
            ->exists();

        if ($isOccupied) {
            throw new Exception("Ghế $seatNumber đã có hành khách khác chọn.");
        }

        // 5. Cập nhật
        $ticket->update([
            'seat_number' => $seatNumber,
            'status' => 'CHECKED_IN'
        ]);

        return $ticket;
    });
}
}