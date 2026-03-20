<?php
namespace App\Application\UseCases\Checkin;

use App\Models\Ticket;
use App\Models\AircraftSeat;
use Illuminate\Support\Facades\DB;

class GetSeatMapUseCase
{
    public function execute(int $ticketId)
    {
        // 1. Lấy thông tin vé để biết Chuyến bay và Hạng ghế của khách
        $ticket = Ticket::with('flight_instance')->findOrFail($ticketId);
        $aircraftId = $ticket->flight_instance->aircraft_id;
        $flightInstanceId = $ticket->flight_instance_id;

        // 2. Lấy tất cả ghế của máy bay này
        $allSeats = AircraftSeat::where('aircraft_id', $aircraftId)
            ->where('is_active', true)
            ->orderByRaw('CAST(SUBSTRING(seat_number, 1, LENGTH(seat_number) - 1) AS INTEGER) ASC')
            ->orderBy(DB::raw('RIGHT(seat_number, 1)'), 'ASC')
            ->get();

        // 3. Lấy danh sách số ghế đã bị chiếm trong chuyến bay này
        $occupiedSeats = Ticket::where('flight_instance_id', $flightInstanceId)
            ->whereIn('status', ['CHECKED_IN']) // Chỉ những vé đã check-in mới tính là chiếm chỗ
            ->whereNotNull('seat_number')
            ->pluck('seat_number')
            ->toArray();

        // 4. Group ghế theo hàng (Ví dụ: Hàng 1, Hàng 2...)
        return $allSeats->groupBy(function ($seat) {
            return preg_replace('/[^0-9]/', '', $seat->seat_number); // Lấy phần số (1, 2, 3...)
        })->map(function ($rowSeats, $rowNumber) use ($occupiedSeats, $ticket) {
            return [
                'row_number' => $rowNumber,
                'seats' => $rowSeats->map(function ($seat) use ($occupiedSeats, $ticket) {
                    return [
                        'seat_number'  => $seat->seat_number,
                        'seat_class'   => $seat->seat_class,
                        'is_available' => !in_array($seat->seat_number, $occupiedSeats),
                        'is_same_class'=> $seat->seat_class === $ticket->seat_class, // Chỉ cho chọn nếu cùng hạng vé
                    ];
                })
            ];
        })->values();
    }
}