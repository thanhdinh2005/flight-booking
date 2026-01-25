<?php

namespace App\Exceptions\Keycloak;

use App\Exceptions\HttpException;

class KeycloakUserExistsException extends HttpException
{
    public function __construct()
    {
        parent::__construct(
            'User already exists',
            409,
            'USER_ALREADY_EXISTS'
        );
    }
}
