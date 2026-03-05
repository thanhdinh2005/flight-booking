<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketAddon extends Model
{
    protected $table = "ticket_addons";

    public $timestamps = false;

    protected $fillable = [
        'ticket_id', 
        'addon_type', 
        'amount'
    ];

    protected $casts = ['amount' => 'decimal:2'];

    public function ticket() { return $this->belongsTo(Ticket::class); }
}
