<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\BookingRequest;

class CustomerRequestStatusUpdatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $requestData;

    public function __construct(BookingRequest $requestData)
    {
        // Load các quan hệ cần thiết để tránh lỗi N+1 trong giao diện Mail
        $this->requestData = $requestData->load(['booking', 'ticket']);
    }

    public function envelope(): Envelope
    {
        $status = $this->requestData->status;
        // Kiểm tra enum hoặc value tùy theo cách bạn định nghĩa
        $statusText = ($status === 'APPROVED' || $status->value === 'APPROVED') ? 'Đã được Chấp nhận' : 'Bị Từ Chối';
        
        return new Envelope(
            subject: "[InteractHub] Thông báo kết quả yêu cầu hoàn vé #{$this->requestData->id} - {$statusText}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.requests.status-updated',
        );
    }
<<<<<<< HEAD
}
=======

    public function attachments(): array
    {
        return [];
    }
}
>>>>>>> 03719d73814324916421bcafb250e351c1e9c262
