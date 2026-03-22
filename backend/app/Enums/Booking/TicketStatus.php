<?php
namespace App\Enums\Booking;

enum TicketStatus: string {
    case ACTIVE = 'ACTIVE';
    case USED   = 'USED';
    case REFUND_PENDING = 'REFUND_PENDING'; // Trạng thái khi khách vừa gửi đơn hoàn
    case REFUNDED = 'REFUNDED';
}