<?php

namespace App\Application\UseCases;



use App\Models\Booking;

use App\Models\Passenger;

use App\Models\Ticket;

use App\Application\Command\Pricing\CalculateBaseFareCommand;

use Illuminate\Support\Facades\DB;

use Illuminate\Support\Str;



class CreateBookingUseCase

{

    protected $calculateCommand;



    public function __construct(CalculateBaseFareCommand $calculateCommand)

    {

        $this->calculateCommand = $calculateCommand;

    }



    public function execute(array $data, $userId): mixed

    {

        return DB::transaction(function () use ($data, $userId) {

            $passengerCount = count($data['passengers']);

           

            // 1. GỌI COMMAND ĐỂ LẤY GIÁ & KIỂM TRA CHỖ

            $pricing = $this->calculateCommand->execute($data['itinerary'], $passengerCount);



            // 2. TẠO BOOKING

            $booking = Booking::create([

                'user_id' => $userId,

                'pnr' => Str::upper(Str::random(6)),

                'total_amount' => $pricing['total_amount'],

                'contact_email' => $data['contact_email'],

                'contact_phone' => $data['contact_phone'],

                'status' => 'PENDING',

                'expires_at' => now()->addMinutes(15),

            ]);



            // 3. TẠO PASSENGERS & TICKETS + TRỪ GHẾ

            foreach ($data['passengers'] as $pData) {

                $passenger = Passenger::create($pData);



                foreach ($data['itinerary'] as $segment) {

                    $fId = $segment['flight_instance_id'];

                    $sClass = $segment['seat_class'];



                    Ticket::create([

                        'booking_id' => $booking->id,

                        'passenger_id' => $passenger->id,

                        'flight_instance_id' => $fId,

                        'seat_class' => $sClass,

                        'ticket_price' => $pricing['segments_price'][$fId],

                        'status' => 'PENDING', // Trạng thái chờ thanh toán

                    ]);



                    // Trừ ghế trong Inventory (Trừ từng ghế một theo vòng lặp Ticket)

                    DB::table('flight_seat_inventory')

                        ->where('flight_instance_id', $fId)

                        ->where('seat_class', $sClass)

                        ->decrement('available_seats', 1);

                }

            }



            return $booking->load(['tickets.passenger', 'tickets.flight_instance', 'tickets.flight_instance.flightSchedule']);

        });

    }

}