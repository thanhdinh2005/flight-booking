<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Content;

class TicketRefundMail extends Mailable
{
    public array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Ticket Refund Confirmation'
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.ticket-refund',
            with: $this->data
        );
    }
}
