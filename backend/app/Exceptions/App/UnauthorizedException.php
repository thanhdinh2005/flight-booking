<?php

namespace App\App\Exceptions;

use App\Exceptions\HttpException;

class UnauthorizedException extends HttpException
{
    public function __construct(string $message)
    {
        parent::__construct($message, 401, 'UNAUTHORIZED');
    }
}
