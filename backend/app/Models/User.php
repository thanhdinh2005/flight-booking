<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = [
        'keycloak_id',
        'email',
    ];

    public static function findByKeycloakId(string $keycloakId)
    {
        return self::where('keycloak_id', $keycloakId)->first();
    }

}
