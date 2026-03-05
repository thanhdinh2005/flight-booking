<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public const UPDATED_AT = null;

    protected $table = "audit_logs";

    protected $fillable = [
        'user_id',
        'action',
        'target_table', 
        'target_id',
        'changes', 
        'ip_address'
    ];
    
    protected $casts = ['changes' => 'array'];

    public function user() { return $this->belongsTo(User::class); }
}
