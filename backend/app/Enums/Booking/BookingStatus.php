<?php
namespace App\Enums\Booking;

enum BookingStatus: string {
    case PENDING   = 'PENDING';
    case PAID      = 'PAID';
    case CANCELLED = 'CANCELLED'; // Do khách hủy hoặc hết hạn thanh toán
    case COMPLETED = 'COMPLETED';
}