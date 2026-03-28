<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\BookingRequest;

class CustomerRequestReceivedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    // 1. PHẢI CÓ DÒNG NÀY: Khai báo biến public để Laravel tự truyền sang Blade
    public $requestData;

    /**
     * 2. PHẢI CÓ DÒNG NÀY: Nhận dữ liệu từ UseCase truyền vào
     */
    public function __construct(BookingRequest $requestData)
    {
        $this->requestData = $requestData;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[InteractHub] Tiếp nhận yêu cầu hoàn vé #' . $this->requestData->id,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.requests.received',
        );
    }
}
