<?php

namespace App\Exceptions;

use Exception;

abstract class HttpException extends Exception
{
    protected int $status;
    protected string $error;

    public function __construct(
        string $message = '',
        int $status = 500,
        string $error = 'INTERNAL_ERROR'
    ) {
        parent::__construct($message);
        $this->status = $status;
        $this->error = $error;
    }

    public function status(): int
    {
        return $this->status;
    }

    public function error(): string
    {
        return $this->error;
    }
}