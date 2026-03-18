<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingRequest extends Model
{
    protected $table = "booking_requests";

    protected $fillable = [
        'booking_id',
        'user_id',
        'ticket_id',      // Thêm vào đây
        'refund_amount',   // Thêm vào đây
        'system_refund_amount', // Số tiền hệ thống tính (Mới bổ sung)
        'request_type',
        'reason',
        'staff_note',
        'status',
        'staff_id',             // ID Admin xử lý (Mới bổ sung)
        'processed_at',

    ];

    protected $casts = [
        'refund_amount' => 'float',
        'system_refund_amount' => 'float',
        'processed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }
    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}
