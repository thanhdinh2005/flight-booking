<?php

namespace App\Exceptions\Keycloak;

use App\Exceptions\HttpException;

class KeycloakBadRequestException extends HttpException
{
    public function __construct(string $message = 'Invalid data')
    {
        parent::__construct($message, 400, 'KEYCLOAK_BAD_REQUEST');
    }
}
