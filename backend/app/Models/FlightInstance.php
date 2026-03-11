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

    public function flightSchedule()
    {
        return $this->belongsTo(FlightSchedule::class, 'flight_schedule_id');
    }

    public function scopeFilter($query, $filters)
    {
        return $query

            ->when($filters['flight_number'] ?? null, function ($q, $value) {
                $q->where('flight_number', 'like', "%{$value}%");
            })

            ->when(
                ($filters['from_date'] ?? null) && ($filters['to_date'] ?? null),
                function ($q) use ($filters) {
                    $q->whereBetween('departure_date', [
                        $filters['from_date'],
                        $filters['to_date']
                    ]);
                }
            )

            ->when($filters['route_id'] ?? null, function ($q, $value) {
                $q->where('route_id', $value);
            })

            ->when($filters['aircraft_id'] ?? null, function ($q, $value) {
                $q->where('aircraft_id', $value);
            })

            ->when($filters['status'] ?? null, function ($q, $value) {
                $q->where('status', $value);
            });
    }
}
