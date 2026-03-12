<?php
namespace App\Application\Command\Pricing;

use Illuminate\Support\Facades\DB;

class CalculateBaseFareCommand
{
    public function execute(array $itinerary, int $passengerCount): array
    {
        $totalBaseAmount = 0;
        $segmentsPriceInfo = [];

        foreach ($itinerary as $segment) {
            $fId = $segment['flight_instance_id'];
            $sClass = $segment['seat_class'];

            // Chỉ lấy dữ liệu (nên dùng lockForUpdate nếu định trừ ghế ngay sau đó)
            $inventory = DB::table('flight_seat_inventory')
                ->where('flight_instance_id', $fId)
                ->where('seat_class', $sClass)
                ->first();

            if (!$inventory || $inventory->available_seats < $passengerCount) {
                throw new \Exception("Chuyến bay ID {$fId} hạng {$sClass} không đủ chỗ.");
            }

            $segmentsPriceInfo[$fId] = $inventory->price;
            $totalBaseAmount += ($inventory->price * $passengerCount);
        }

        return [
            'total_amount' => $totalBaseAmount,
            'segments_price' => $segmentsPriceInfo
        ];
    }
}