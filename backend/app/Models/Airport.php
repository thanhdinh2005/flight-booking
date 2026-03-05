<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Airport extends Model
{
    protected $table = 'airports';

    protected $fillable = [
        'code',
        'name',
        'city',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    // Lấy các tuyến bay xuất phát từ sân bay này
    public function departingRoutes(): HasMany
    {
        return $this->hasMany(Route::class, 'origin_airport_id');
    }

    // Lấy các tuyến bay đến sân bay này
    public function arrivingRoutes(): HasMany
    {
        return $this->hasMany(Route::class, 'destination_airport_id');
    }
}
