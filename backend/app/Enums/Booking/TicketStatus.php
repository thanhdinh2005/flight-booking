<?php
namespace App\Enums\Booking;

enum TicketStatus: string {
    case PENDING = "PENDING";
    case CHECKED_IN = "CHECKED_IN";
    case ACTIVE = 'ACTIVE';
    case CANCELLED   = 'CANCELLED';
    case REFUND_PENDING = 'REFUND_PENDING'; // Trạng thái khi khách vừa gửi đơn hoàn
    case REFUNDED = 'REFUNDED';
}