<?php

namespace App\Console\Commands;

use App\Models\FlightInstance;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateFlightStatuses extends Command
{
    protected $signature = 'flight:update-status';

    protected $description = 'Tự động cập nhật trạng thái chuyến bay (BOARDING, DEPARTED, ARRIVED) dựa trên thời gian thực';

    public function handle()
    {
        $now = now();

        $boardingCount = FlightInstance::where('status', 'SCHEDULED')
            ->whereRaw('COALESCE(etd, std) <= ?', [$now->copy()->addMinutes(30)])
            ->update(['status' => 'BOARDING']);

        $departedCount = FlightInstance::where('status', 'BOARDING')
            ->whereRaw('COALESCE(etd, std) <= ?', [$now])
            ->update(['status' => 'DEPARTED']);

        $arrivedFromDeparted = FlightInstance::where('status', 'DEPARTED')
            ->whereRaw('COALESCE(eta, sta) <= ?', [$now])
            ->update(['status' => 'DEPARTED']);

        $boardingDelayed = FlightInstance::where('status', 'DELAYED')
            ->whereRaw('COALESCE(etd, std) <= ?', [$now->copy()->addMinutes(30)])
            ->update(['status' => 'BOARDING']);

        $departedDelayed = FlightInstance::where('status', 'DELAYED')
            ->whereRaw('COALESCE(etd, std) <= ?', [$now])
            ->update(['status' => 'DEPARTED']);

        $arrivedDelayed = FlightInstance::where('status', 'DELAYED')
            ->whereRaw('COALESCE(eta, sta) <= ?', [$now])
            ->update(['status' => 'DEPARTED']);

        $totalArrived = $arrivedFromDeparted + $arrivedDelayed;

        Log::info(
            "Auto update flights: 
            SCHEDULED→BOARDING={$boardingCount}, 
            BOARDING→DEPARTED={$departedCount}, 
            DELAYED→BOARDING={$boardingDelayed}, 
            DELAYED→DEPARTED={$departedDelayed}, 
            ARRIVED={$totalArrived}"
        );

        $this->info("=== Flight Status Update ===");
        $this->info("SCHEDULED → BOARDING: {$boardingCount}");
        $this->info("BOARDING → DEPARTED: {$departedCount}");
        $this->info("DELAYED → BOARDING: {$boardingDelayed}");
        $this->info("DELAYED → DEPARTED: {$departedDelayed}");
        $this->info("ARRIVED (total): {$totalArrived}");

        if (
            $boardingCount === 0 &&
            $departedCount === 0 &&
            $boardingDelayed === 0 &&
            $departedDelayed === 0 &&
            $totalArrived === 0
        ) {
            $this->info("Không có chuyến bay nào cần cập nhật.");
        }
    }
}