<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlightInstance extends Model
{
    protected $fillable = [
        'flight_schedule_id',
        'route_id',
        'aircraft_id',
        'flight_number',
        'departure_date',
        'std',
        'sta',
        'etd',
        'eta',
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

    // Để chạy được 'aircraft'
    public function aircraft()
    {
        return $this->belongsTo(Aircraft::class, 'aircraft_id');
    }
}
