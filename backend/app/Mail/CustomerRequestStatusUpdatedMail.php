<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerRequestStatusUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;
public $requestData;
    /**
     * Create a new message instance.
     */
    public function __construct($requestData)
    {
        $this->requestData = $requestData;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $statusText = $this->requestData->status === 'APPROVED' ? 'Đã được Duyệt' : 'Bị Từ Chối';
    return new Envelope(
        subject: "[InteractHub] Yêu cầu của bạn $statusText",
    );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'view.name',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
