<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $table="transactions";
    
    public $timestamps = false;
    
    protected $fillable = [
        'booking_id', 
        'amount', 
        'type', 
        'payment_method', 
        'gateway_transaction_id', 
        'status'
    ];

    protected $casts = ['amount' => 'decimal:2'];
}
