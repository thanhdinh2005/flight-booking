<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $table = "bookings";

    protected $fillable = [
        'user_id',
        'pnr',
        'total_amount',
        'status',
        'contact_email',
        'contact_phone',
        'expires_at'
    ];

    public function tickets() { return $this->hasMany(Ticket::class); }
    public function transactions() { return $this->hasMany(Transaction::class); }
   // Một Booking có nhiều hành khách THÔNG QUA bảng tickets
    public function passengers() {
        return $this->hasManyThrough(Passenger::class, Ticket::class, 'booking_id', 'id', 'id', 'passenger_id');
    }

public function user() {
    return $this->belongsTo(User::class);
}
}
