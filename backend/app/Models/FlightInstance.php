<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlightInstance extends Model
{
    protected $table = "flight_instances";

    protected $fillable = [
        'flight_schedule_id',
        'route_id',
        'aircraft_id',
        'flight_number',
        'departure_date',
        'std', // Schedule Time of Departure
        'sta', // Schedule Time of Arrival
        'etd', // Estimated Time of Departure
        'eta', // Estimated Time of Arrival
        'status',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'std' => 'datetime',
        'sta' => 'datetime',
        'etd' => 'datetime',
        'eta' => 'datetime',
    ];
    public function route()
    {
        return $this->belongsTo(Route::class, 'route_id');
    }

    public function aircraft()
    {
        return $this->belongsTo(Aircraft::class, 'aircraft_id');
    }
    public function tickets() {
    return $this->hasMany(Ticket::class);
}
    public function seatInventories()
    {
        return $this->hasMany(FlightSeatInventory::class, 'flight_instance_id');
    }

}
