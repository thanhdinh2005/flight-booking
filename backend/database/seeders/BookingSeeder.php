<?php

namespace Database\Seeders;

use App\Application\UseCases\ConfirmPaymentUseCase;
use App\Application\UseCases\CreateBookingUseCase;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\FlightInstance;
use App\Models\User;

class BookingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(CreateBookingUseCase $createBookingUseCase, ConfirmPaymentUseCase $confirmPaymentUseCase): void
    {
        $user = User::first();
        if (!$user) {
            $this->command->warn('Vui lòng seed bảng users trước!');
            return;
        }

        $flights = FlightInstance::orderBy('std', 'asc')
            ->take(20)
            ->get();
        if ($flights->isEmpty()) {
            $this->command->warn('Vui lòng seed bảng flight_instances trước!');
            return;
        }

        for ($i = 1; $i <= 20; $i++) {
            
            // Lấy ngẫu nhiên 1 user và 1 chuyến bay cho mỗi vòng lặp
            $user = $user;
            $flight = $flights->random();
            
            // Random số lượng khách từ 1 đến 3 người cho mỗi Booking
            $passengerCount = rand(1, 3);
            $passengers = [];

            for ($p = 0; $p < $passengerCount; $p++) {
                $passengers[] = [
                    'first_name' => 'NGUYEN',
                    'last_name' => strtoupper(Str::random(5)), // Random tên để dễ phân biệt
                    'gender' => rand(0, 1) ? 'male' : 'female',
                    'date_of_birth' => '1990-01-01',
                    'id_number' => '00112233' . rand(1000, 9999),
                    'type' => 'adult',
                ];
            }

            // Dữ liệu giả lập payload từ FE
            $requestData = [
                'contact_email' => $user->email,
                'contact_phone' => '0900000000',
                'passengers' => $passengers,
                'itinerary' => [
                    [
                        'flight_instance_id' => $flight->id,
                        'seat_class' => 'ECONOMY'
                    ]
                ]
            ];

            try {
                // 1. Chạy UseCase tạo Booking (Trạng thái PENDING ban đầu)
                $booking = $createBookingUseCase->execute($requestData, $user->id);

                // 2. Chạy UseCase Confirm Payment để chuyển Booking thành PAID luôn
                $mockTransactionId = 'VNP' . time() . rand(1000, 9999);
                $confirmPaymentUseCase->execute(
                    $booking->id,
                    'VNPAY',
                    'MOCK_REF_' . Str::random(10), // gateway_reference
                    $booking->total_amount,
                    $mockTransactionId,
                    [
                        'vnp_TxnRef' => 'MOCK_REF_' . Str::random(10),
                        'vnp_PayDate' => now()->format('YmdHis'),
                        'vnp_BankCode' => 'MOCKBANK',
                    ]
                );        
            } catch (\Exception $e) {
                // Nếu chuyến bay được random ngẫu nhiên bị hết ghế, báo lỗi và đi tiếp vòng lặp sau
                $this->command->error("Bỏ qua Booking {$i} do lỗi: " . $e->getMessage());
            }
        }
    }
}
