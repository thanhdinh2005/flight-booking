<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    protected $table = "tickets";

    protected $fillable = [
        'booking_id', 
        'flight_instance_id', 
        'passenger_name', 
        'passenger_dob', 
        'passenger_ic', 
        'seat_class', 
        'seat_number', 
        'ticket_price', 
        'status'
    ];
    
    protected $casts = ['passenger_dob' => 'date', 'ticket_price' => 'decimal:2'];

    public function addons() { return $this->hasMany(TicketAddon::class); }
}
