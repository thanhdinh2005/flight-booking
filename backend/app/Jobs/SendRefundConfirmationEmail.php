<?php

namespace App\Jobs;

use App\Mail\TicketRefundMail;
use App\Models\Ticket;
use App\Models\FlightInstance;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendRefundConfirmationEmail implements ShouldQueue
{
    use Queueable;

    protected $booking;
    protected $refundAmount;

    public function __construct($booking, $refundAmount)
    {
        $this->booking = $booking;
        $this->refundAmount = $refundAmount;
    }

    public function handle(): void
    {
        $ticket = Ticket::where('booking_id', $this->booking->id)->first();

        if (!$ticket) return;

        $flightInstance = FlightInstance::find($ticket->flight_instance_id);

        $data = [
            'passenger_name' => $this->booking->contact_name,
            'flight_number' => $flightInstance->flight_number ?? '',
            'departure' => $flightInstance->departure_airport ?? '',
            'arrival' => $flightInstance->arrival_airport ?? '',
            'departure_time' => $flightInstance->std ?? '',
            'booking_code' => $this->booking->code,
            'refund_amount' => $this->refundAmount,
            'refund_method' => 'VNPay'
        ];

        Mail::to($this->booking->contact_email)
            ->send(new TicketRefundMail($data));
    }
}