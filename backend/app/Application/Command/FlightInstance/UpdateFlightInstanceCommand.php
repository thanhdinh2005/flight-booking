<?php

namespace App\Application\Command\FlightInstance;

use App\Models\FlightInstance;
use Carbon\Carbon;

class UpdateFlightInstanceCommand
{
    public function execute(
        FlightInstance $instance,
        Carbon $newEtd
    ): FlightInstance {

        $std = Carbon::parse($instance->std);
        $sta = Carbon::parse($instance->sta);

        $delayMinutes = $std->diffInMinutes($newEtd);

        $eta = $sta->copy()->addMinutes($delayMinutes);

        $instance->update([
            'etd' => $newEtd,
            'eta' => $eta,
            'status' => 'DELAYED'
        ]);

        return $instance->refresh();
    }
}