<?php
namespace App\Enums\Flight;

enum FlightStatus: string {
    case SCHEDULED = 'SCHEDULED';
    case DEPARTED  = 'DEPARTED';
    case ARRIVED = 'ARRIVED';
    case LANDED    = 'LANDED';
    case DELAYED   = 'DELAYED';
    case CANCELLED = 'CANCELLED';
}