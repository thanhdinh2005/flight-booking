<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\Booking\BookingStatus; // Giả sử bạn đặt trong thư mục này
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

    protected $casts = [
        // Tự động convert string trong DB sang Enum Object trong PHP
        'status' => BookingStatus::class,
        'expires_at' => 'datetime',
        'total_amount' => 'decimal:2',
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
