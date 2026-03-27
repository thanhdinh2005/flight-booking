<?php
namespace App\Application\UseCases\Checkin;

use App\Models\Ticket;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Exception;
use Illuminate\Support\Facades\Mail; // Thêm dòng này
use App\Mail\BoardingPassMail; 


class CheckinUseCase
{
    public function execute(int $ticketId, string $seatNumber, string $token)
    {
        $cachedToken = Cache::get("checkin_token_{$ticketId}");
        if (!$cachedToken || $cachedToken !== $token) {
            throw new Exception("Phiên xác thực đã hết hạn hoặc không hợp lệ.", 403);
        }

        return DB::transaction(function () use ($ticketId, $seatNumber) {
            $ticket = Ticket::lockForUpdate()->findOrFail($ticketId);
            $userSeatClass = $ticket->seat_class;

            $targetSeat = \App\Models\AircraftSeat::where('aircraft_id', $ticket->flight_instance->aircraft_id)
                ->where('seat_number', $seatNumber)
                ->first();

            if (!$targetSeat) {
                throw new Exception("Chỗ ngồi không tồn tại trên máy bay này.", 404);
            }

            if ($targetSeat->seat_class !== $userSeatClass) {
                throw new Exception("Bạn không thể chọn ghế hạng {$targetSeat->seat_class} với vé hạng {$userSeatClass}.", 403);
            }

            $alreadyTaken = Ticket::where('flight_instance_id', $ticket->flight_instance_id)
                ->where('seat_number', $seatNumber)
                ->where('status', 'CHECKED_IN')
                ->exists();

            if ($alreadyTaken) {
                throw new Exception("Ghế {$seatNumber} vừa có người chọn.", 409);
            }

            // Cập nhật trạng thái
            $ticket->update([
                'seat_number' => $seatNumber,
                'status' => 'CHECKED_IN',
                'checked_in_at' => now()
            ]);

            $ticket->load(['passenger', 'flight_instance.flightSchedule.route', 'booking']);

            if ($ticket->booking->contact_email) {
                Mail::to($ticket->booking->contact_email)->queue(new BoardingPassMail($ticket));
            }

            Cache::forget("checkin_token_{$ticketId}");

            return $ticket;
        });
    }
}
