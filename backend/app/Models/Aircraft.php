<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\SystemStatus; // Dùng chung ACTIVE, INACTIVE, MAINTENANCE
class Aircraft extends Model
{
    protected $table = 'aircrafts';

    protected $fillable = [
        'model', 
        'registration_number', 
        'total_economy_seats', 
        'total_business_seats', 
        'status',
    ];

    protected $casts = [
        'status' => SystemStatus::class,
        'total_economy_seats' => 'integer',
        'total_business_seats' => 'integer',
    ];
    public function schedules(): HasMany
    {
        return $this->hasMany(FlightSchedule::class);
    }
}   
