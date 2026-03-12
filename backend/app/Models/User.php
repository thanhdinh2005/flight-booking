<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
   
protected $table = 'users';

    protected $fillable = [
        'keycloak_id',
        'email',
        'full_name',
        'role',
        'phone_number',
        'status',
        'disabled_at',
    ];

    protected $casts = [
        'keycloak_id' => 'string',
        'disabled_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    
    public static function findByKeycloakId(string $keycloakId)
    {
        return self::where('keycloak_id', $keycloakId)->first();
    }

    public function scopeFilter($query, $filters)
    {
        return $query
            ->when($filters['phone'] ?? null, function ($q, $phone) {
                $q->where('phone', 'like', "%$phone%");
            })

            ->when($filters['email'] ?? null, function ($q, $email) {
                $q->where('email', 'like', "%$email%");
            })

            ->when($filters['full_name'] ?? null, function ($q, $name) {
                $q->where('full_name', 'like', "%$name%");
            })

            ->when($filters['role'] ?? null, function ($q, $role) {
                $q->where('role', $role);
            })

            ->when($filters['created_from'] ?? null, function ($q, $date) {
                $q->where('created_at', '>=', $date);
            })

            ->when($filters['created_to'] ?? null, function ($q, $date) {
                $q->where('created_at', '<=', $date);
            })

            ->when(isset($filters['disabled']), function ($q) use ($filters) {
                if ($filters['disabled']) {
                    $q->whereNotNull('disable_at');
                } else {
                    $q->whereNull('disable_at');
                }
            });
    }
}
