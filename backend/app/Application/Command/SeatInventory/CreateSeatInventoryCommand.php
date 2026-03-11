<?php

namespace App\Application\Command\SeatInventory;

use App\Application\Command\Pricing\BasePricingCommand;
use App\Exceptions\EntityNotFoundException;
use App\Models\Aircraft;
use App\Models\FlightInstance;
use App\Models\FlightSeatInventory;
use Illuminate\Support\Facades\DB;

class CreateSeatInventoryCommand
{
    public function execute(int $flightInstanceId): void
    {
        $instance = FlightInstance::find($flightInstanceId);

        if (!$instance) {
            throw new EntityNotFoundException("Không tìm thấy chuyến bay");
        }

        $aircraft = Aircraft::find($instance->aircraft_id);

        if (!$aircraft) {
            throw new EntityNotFoundException("Không tìm thấy máy bay");
        }

        DB::transaction(function () use ($instance, $aircraft) {

            $pricing = app(BasePricingCommand::class);

            FlightSeatInventory::insert([
                [
                    'flight_instance_id' => $instance->id,
                    'seat_class' => 'ECONOMY',
                    'total_seats' => $aircraft->total_economy_seats,
                    'available_seats' => $aircraft->total_economy_seats,
                    'price' => $pricing->execute($instance, 'ECONOMY'),
                    'currency' => 'VND',
                    'created_at' => now(),
                    'updated_at' => now()
                ],
                [
                    'flight_instance_id' => $instance->id,
                    'seat_class' => 'BUSINESS',
                    'total_seats' => $aircraft->total_business_seats,
                    'available_seats' => $aircraft->total_business_seats,
                    'price' => $pricing->execute($instance, 'BUSINESS'),
                    'currency' => 'VND',
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            ]);
        });
    }
}
