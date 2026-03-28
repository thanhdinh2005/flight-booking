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

    // QUAN TRỌNG: Khai báo biến public để Blade nhận được $requestData
    public $requestData;

    /**
     * Nhận đối tượng BookingRequest từ Admin UseCase
     */
    public function __construct(BookingRequest $requestData)
    {
        $this->requestData = $requestData;
    }

    /**
     * Tiêu đề Mail thay đổi theo trạng thái APPROVED/REJECTED
     */
    public function envelope(): Envelope
    {
        $statusText = $this->requestData->status->value === 'APPROVED' ? 'Đã được Duyệt' : 'Bị Từ Chối';
        
        return new Envelope(
            subject: "[InteractHub] Yêu cầu hoàn vé #{$this->requestData->id} {$statusText}",
        );
    }

    /**
     * Trỏ đến file giao diện mail kết quả
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.requests.status-updated',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
