<?php
namespace App\Enums;

enum SystemStatus: string {
    case ACTIVE = 'ACTIVE';
    case INACTIVE = 'INACTIVE';
    case MAINTENANCE = 'MAINTENANCE'; // Riêng cho máy bay
}