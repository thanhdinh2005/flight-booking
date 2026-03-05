<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FlightSchedule extends Model
{
    protected $table = 'flight_schedules';

    protected $fillable = [
        'route_id', 
        'flight_number', 
        'departure_time', 
        'days_of_week', 
        'aircraft_id', 
        'is_active'
    ];

    protected $casts = [
        'days_of_week' => 'array', 
        'is_active' => 'boolean',
    ];

    public function route(): BelongsTo
    {
        return $this->belongsTo(Route::class);
    }

    public function aircraft(): BelongsTo
    {
        return $this->belongsTo(Aircraft::class);
    }

    /**
     * Scope để chỉ lấy các lịch trình đang hoạt động
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
