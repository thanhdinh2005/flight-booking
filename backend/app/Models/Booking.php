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
}
