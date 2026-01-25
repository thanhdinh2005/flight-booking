<?php

namespace App\Exceptions\Keycloak;

use App\Exceptions\HttpException;

class KeycloakOperationException extends HttpException
{
    public function __construct(string $message = 'Keycloak operation failed')
    {
        parent::__construct($message, 500, 'KEYCLOAK_OPERATION_FAILED');
    }
}