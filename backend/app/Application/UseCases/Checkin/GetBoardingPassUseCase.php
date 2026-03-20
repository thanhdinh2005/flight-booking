<?php

namespace App\Application\UseCases\Checkin;

use App\Models\Ticket;
use Exception;
use Illuminate\Support\Facades\Crypt;

class GetBoardingPassUseCase
{
    /**
     * @param int $ticketId
     * @param mixed $userId  <-- Truyền vào từ Controller
     * @return array
     * @throws Exception
     */
    public function execute(int $ticketId, $userId): array
    {
        // 1. Lấy vé kèm thông tin hành trình theo đúng quan hệ Model đã gửi
        $ticket = Ticket::with([
            'passenger',
            'flight_instance.route.origin',      // Đã đổi theo Model Route (origin)
            'flight_instance.route.destination', // Đã đổi theo Model Route (destination)
            'flight_instance.aircraft',
            'booking'
        ])
        ->where('id', $ticketId)
        ->whereHas('booking', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->first();

        if (!$ticket) {
            throw new Exception("Vé không tồn tại hoặc bạn không có quyền truy cập.", 403);
        }

        // 2. Kiểm tra xem đã check-in chưa
        if ($ticket->status !== 'CHECKED_IN' || empty($ticket->seat_number)) {
            throw new Exception("Vui lòng hoàn tất chọn ghế trước khi xem thẻ lên máy bay.", 400);
        }

        $instance = $ticket->flight_instance;
        $route = $instance->route;

        // 3. Logic thời gian (Sử dụng cột 'std' từ FlightInstance của bạn)
        // Lưu ý: Đảm bảo 'std' đã được cast là 'datetime' trong Model
        $departureTime = $instance->std; 
        $boardingTime = $departureTime->copy()->subMinutes(40);
        $gateClosing = $departureTime->copy()->subMinutes(15);

        // 4. Tạo nội dung mã QR
        $qrData = Crypt::encryptString(json_encode([
            't_id' => $ticket->id,
            'pnr'  => $ticket->pnr,
            'seat' => $ticket->seat_number
        ]));

        // 5. Trả về dữ liệu chuẩn cho FE
        return [
            'ticket_info' => [
                'id' => $ticket->id,
                'pnr' => $ticket->pnr,
                'seat' => $ticket->seat_number,
                'class' => $ticket->seat_class,
                'sequence_no' => $ticket->id,
            ],
            'passenger' => [
                'full_name' => strtoupper($ticket->passenger->last_name . ' ' . $ticket->passenger->first_name),
            ],
            'flight' => [
                'number' => $instance->flight_number, // Lấy từ FlightInstance
                'aircraft' => $instance->aircraft->model_name ?? 'N/A',
                'gate' => $instance->gate ?? 'TBA',
            ],
            'route' => [
                'from_code' => $route->origin->iata_code, // Model Route dùng origin()
                'from_city' => $route->origin->city,
                'to_code'   => $route->destination->iata_code, // Model Route dùng destination()
                'to_city'   => $route->destination->city,
            ],
            'schedule' => [
                'date' => $instance->departure_date->format('d M Y'),
                'boarding_time' => $boardingTime->format('H:i'),
                'departure_time' => $departureTime->format('H:i'),
                'gate_closing' => $gateClosing->format('H:i'),
            ],
            'qr_code_content' => $qrData
        ];
    }
}