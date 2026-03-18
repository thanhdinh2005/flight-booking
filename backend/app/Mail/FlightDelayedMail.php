<?php

namespace App\Mail;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FlightDelayedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $passengerName,
        public string $oldDepartureTime,
        public string $newDepartureTime
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '✈️ Flight Delay Notice - Booking: ' . $this->booking->pnr,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.flight_delayed',
            with: [
                'booking' => $this->booking,
                'passenger_name' => $this->passengerName,
                'old_departure_time' => Carbon::parse($this->oldDepartureTime)->format('H:i d/m/Y'),
                'new_departure_time' => Carbon::parse($this->newDepartureTime)->format('H:i d/m/Y'),
            ],
        );
    }
}