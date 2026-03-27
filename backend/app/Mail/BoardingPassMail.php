<?php

namespace App\Mail;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BoardingPassMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $ticket;

    /**
     * Khởi tạo class với dữ liệu Ticket đã Check-in
     */
    public function __construct(Ticket $ticket)
    {
        // Đảm bảo ticket đã được load các quan hệ cần thiết trước khi truyền vào đây
        $this->ticket = $ticket;
    }

    /**
     * Thiết lập Tiêu đề và Người gửi
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Thẻ lên máy bay điện tử - Ghế ' . $this->ticket->seat_number . ' [' . $this->ticket->booking->pnr . ']',
        );
    }

    /**
     * Thiết lập View hiển thị
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.boarding-pass', // Chúng ta sẽ tạo file này ở bước sau
        );
    }

    /**
     * (Tùy chọn) Đính kèm file PDF nếu bạn có cài đặt thư viện dompdf
     */
    public function attachments(): array
    {
        return [];
    }
}