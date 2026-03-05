<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function schedules(): HasMany
    {
        return $this->hasMany(FlightSchedule::class);
    }
}
