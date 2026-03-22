<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\Flight\FlightStatus; // Tạo Enum này cho: SCHEDULED, DELAYED, CANCELLED, LANDED
class FlightInstance extends Model
{
    protected $table = "flight_instances";

    const STATUS_SCHEDULED = 'SCHEDULED';
    const STATUS_DELAYED = 'DELAYED';
    const STATUS_DEPARTED = 'DEPARTED';

    protected $fillable = [
        'flight_schedule_id',
        'route_id',
        'aircraft_id',
        'departure_date',
        'std', // Schedule Time of Departure
        'sta', // Schedule Time of Arrival
        'etd', // Estimated Time of Departure
        'eta', // Estimated Time of Arrival
        'status', // SCHEDULED, BOARDING, DELAYED, DEPARTED, CANCELLED
    ];

    protected $casts = [
        'status' => FlightStatus::class,
        'departure_date' => 'date',
        'std' => 'datetime',
        'sta' => 'datetime',
        'etd' => 'datetime',
        'eta' => 'datetime',
    ];
    public function isDeparted(): bool
    {
        return $this->std->isPast();
    }
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
