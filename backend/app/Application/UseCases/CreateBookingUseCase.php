<?php

namespace App\Application\UseCases;

use App\Models\FlightInstance;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Passenger;
class CreateBookingUseCase
{
    public function execute(array $data){
        // Dùng Transaction để đảm bảo nếu lưu hành khách lỗi thì Booking cũng bị hủy
        return DB::transaction(function () use ($data) {
            // 1. Tao booking tong truoc(thong tin lien he va PNR)
            $booking = Booking::create([
                'user_id' => $data['user_id'],
                'pnr' => Str::upper(Str::random(6)), // Tạo PNR ngẫu nhiên
                'total_amount' => 0, // Tạm thời để 0, sẽ cập nhật sau khi tính tổng
                'status' => 'PENDING',
                'contact_email' => $data['contact_email'],
                'contact_phone' => $data['contact_phone'],
                'expires_at' => now()->addMinutes(15) // Đặt thời gian hết hạn
            ]);
// Đếm số lượng hành khách để trừ chỗ
    $passengerCount = count($data['passengers']);
    // Kiểm tra và Trừ số chỗ ngồi trong FlightInstance
    $flightInstance = FlightInstance::lockForUpdate()->find($data['flight_instance_id']);
    if ($flightInstance->available_seats < $passengerCount) {
        throw new \Exception("Chuyến bay đã hết chỗ hoặc không đủ chỗ cho đoàn của bạn.");
    }
     $flightInstance->decrement('available_seats', $passengerCount);
            //2 Lặp qua danh sách hành khách từ Validation gửi lên
            foreach ($data['passengers'] as $passenger){
                //2.1 tao passenger
                $passenger = Passenger::create([
                    'first_name' => $passenger['first_name'],
                    'last_name' => $passenger['last_name'],
                    'gender' => $passenger['gender'],
                    'date_of_birth' => $passenger['date_of_birth'],
                    'id_number' => $passenger['id_number'],
                    'type' => $passenger['type']
                ]);

                //2.2 tao ticket
                $ticket = Ticket::create([
                    'booking_id' => $booking->id,
                    'flight_instance_id' => $data['flight_instance_id'],
                    'passenger_id' => $passenger->id, // Lưu ID hành khách thay vì thông tin trực tiếp
                    'seat_class' => $data['seat_class'],
                    'ticket_price' => 0, // Tạm thời để 0, sẽ cập nhật sau khi tính giá
                    'status' => 'ACTIVE'
                    ]);
                if (!empty($passenger['addons'])) {
                    foreach ($passenger['addons'] as $addon) {
                        TicketAddon::create([
                            'ticket_id' => $ticket->id,
                            'addon_type' => $addon['addon_type'],
                            'amount' => $addon['amount']
                        ]);
                    }
                }
               
            }

            // tra ve booking kem theo du lieu 
            return $booking->load('tickets.passenger', 'tickets.flightInstance.route.origin', 'tickets.flightInstance.route.destination');
        });
    }
}