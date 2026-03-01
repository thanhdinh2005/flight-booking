<?php

namespace App\Models;

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

}
