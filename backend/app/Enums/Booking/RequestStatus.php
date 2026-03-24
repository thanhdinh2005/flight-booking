<?php
namespace App\Enums\Booking;

enum RequestStatus: string {
    case PENDING = 'PENDING';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
}