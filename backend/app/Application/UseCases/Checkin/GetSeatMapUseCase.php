<?php

namespace App\Application\UseCases\Checkin;

use App\Models\Ticket;
use App\Models\AircraftSeat;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache; // Thêm Facade Cache
use Exception;
use App\Enums\Booking\TicketStatus;
class GetSeatMapUseCase
{
    /**
     * @param int $ticketId
     * @param string $token Token nhận được từ bước Verify
     */
    public function execute(int $ticketId, string $token)
    {
        // 1. KIỂM TRA GIẤY THÔNG HÀNH (Security Check)
        $cachedToken = Cache::get("checkin_token_{$ticketId}");
        
        if (!$cachedToken || $cachedToken !== $token) {
            throw new Exception("Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng xác thực lại.", 403);
        }

        // 2. Lấy thông tin vé để biết Chuyến bay và Hạng ghế của khách
        $ticket = Ticket::with('flight_instance')->findOrFail($ticketId);
        $aircraftId = $ticket->flight_instance->aircraft_id;
        $flightInstanceId = $ticket->flight_instance_id;

        // 3. Lấy tất cả ghế của máy bay này (Giữ nguyên logic sắp xếp của bạn)
        // 3. Lấy tất cả ghế của máy bay này
$allSeats = AircraftSeat::where('aircraft_id', $aircraftId)
    ->where('is_active', true)
    ->orderByRaw("CAST(NULLIF(regexp_replace(seat_number, '\D', '', 'g'), '') AS INTEGER) ASC")
    ->orderByRaw("RIGHT(seat_number, 1) ASC")
    ->get();

        // 4. Lấy danh sách số ghế đã bị chiếm trong chuyến bay này
        $occupiedSeats = Ticket::where('flight_instance_id', $flightInstanceId)
            ->where('status', TicketStatus::CHECKED_IN->value)
            ->whereNotNull('seat_number')
            ->pluck('seat_number')
            ->toArray();

        // 5. Group ghế theo hàng và trả về dữ liệu
        return $allSeats->groupBy(function ($seat) {
            return preg_replace('/[^0-9]/', '', $seat->seat_number); 
        })->map(function ($rowSeats, $rowNumber) use ($occupiedSeats, $ticket) {
            return [
                'row_number' => $rowNumber,
                'seats' => $rowSeats->map(function ($seat) use ($occupiedSeats, $ticket) {
    $isAvailable = !in_array($seat->seat_number, $occupiedSeats);
    $isSameClass = $seat->seat_class === $ticket->seat_class;

    return [
        'seat_number'   => $seat->seat_number,
        'seat_class'    => $seat->seat_class,
        'is_available'  => $isAvailable,
        'is_same_class' => $isSameClass,
        // Khách chỉ được chọn nếu ghế CÒN TRỐNG và CÙNG HẠNG VÉ
        'selectable'    => $isAvailable && $isSameClass 
    ];
})->values() // Đảm bảo mảng seats liên tục
            ];
        })->values();
    }
}