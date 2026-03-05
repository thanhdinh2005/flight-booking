<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlightSeatInventory extends Model
{
    protected $table = 'flight_seat_inventory';

    protected $fillable = [
        'flight_instance_id', 
        'seat_class', 
        'total_seats', 
        'available_seats', 
        'price', 
        'currency'
    ];

    public function flightInstance() { return $this->belongsTo(FlightInstance::class); }

}
