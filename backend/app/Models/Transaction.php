<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $table = "transactions";
    
    // BẬT LÊN vì DB của bạn có cột created_at
    public $timestamps = true; 
    
    // Nếu bạn không có cột updated_at trong DB, hãy chỉ định rõ:
    const UPDATED_AT = null; 

    protected $fillable = [
        'booking_id', 
        'amount', 
        'type', 
        'payment_method', 
        'gateway_transaction_id', 
        'status'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];
}