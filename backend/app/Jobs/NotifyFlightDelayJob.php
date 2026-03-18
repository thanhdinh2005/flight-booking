<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Mail\FlightDelayedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotifyFlightDelayJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private int $flightInstanceId,
        private string $oldDepartureTime,
        private string $newDepartureTime
    ) {}

    public function handle(): void
    {
        Booking::whereHas('tickets', function ($query) {
            $query->where('flight_instance_id', $this->flightInstanceId)
                  ->whereIn('status', ['ACTIVE','CHECKED_IN']);
        })
        ->with([
            'tickets' => function ($query) {
                $query->where('flight_instance_id', $this->flightInstanceId);
            },
            'tickets.flight_instance.route.origin',
            'tickets.flight_instance.route.destination'
        ])
        ->chunk(100, function ($bookings) {

            foreach ($bookings as $booking) {

                if (empty($booking->contact_email)) {
                    continue;
                }

                try {

                    $ticket = $booking->tickets->first();

                    if (!$ticket) {
                        continue;
                    }

                    $passengerName = $ticket->passenger_name ?? 'Passenger';

                    Mail::to($booking->contact_email)->queue(
                        new FlightDelayedMail(
                            booking: $booking,
                            passengerName: $passengerName,
                            oldDepartureTime: $this->oldDepartureTime,
                            newDepartureTime: $this->newDepartureTime
                        )
                    );

                } catch (\Throwable $e) {

                    Log::error(
                        "Delay email failed for PNR {$booking->pnr}: "
                        . $e->getMessage()
                    );

                }

            }

        });
    }
}