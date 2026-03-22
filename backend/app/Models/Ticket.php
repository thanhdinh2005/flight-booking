<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\Booking\TicketStatus;
class Ticket extends Model
{
    protected $table = "tickets";

    protected $fillable = [
        'booking_id', 
        'flight_instance_id', 
        'passenger_id', // Thay vì lưu tên, DOB, IC trực tiếp, chúng ta sẽ liên kết tới bảng passengers 
        'seat_class', 
        'seat_number', 
        'ticket_price', 
        'status'
    ];
    protected $casts = [
        'status' => TicketStatus::class,
        'ticket_price' => 'decimal:2',
    ];
    public function booking() {
        return $this->belongsTo(Booking::class);
    }

    public function passenger() {
        return $this->belongsTo(Passenger::class);
    }

    public function flight_instance() {
        return $this->belongsTo(FlightInstance::class);
    }
    public function addons() {
    return $this->hasMany(TicketAddon::class);
}
public function bookingRequests()
{
    return $this->hasMany(BookingRequest::class);
}
}
