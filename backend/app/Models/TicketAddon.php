<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketAddon extends Model
{
    protected $table = "ticket_addons";

    public $timestamps = false;

    protected $fillable = [
        'ticket_id', 
        'addon_id', 
        'amount',
        'quantity'
    ];

   public function addon()
    {
        return $this->belongsTo(Addon::class, 'addon_id');
    }

    /**
     * Liên kết với Ticket để biết dịch vụ này của ai, chặng nào
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }
}
