<?php

namespace App\Http\Response;

class ApiResponse
{
    public bool $success;
    public mixed $message;
    public mixed $data;

    private function __construct(bool $success, mixed $message = null, mixed $data = null)
    {
        $this->success = $success;
        $this->message = $message;
        $this->data    = $data;
    }

    public static function empty(): self
    {
        return new self(false);
    }

    public static function success(mixed $data): self
    {
        return new self(true, null, $data);
    }

    public static function successWithMessage(string $message, mixed $data): self
    {
        return new self(true, $message, $data);
    }

    public static function error(string $message): self
    {
        return new self(false, $message, null);
    }

    public static function errorList(array $messages): self
    {
        return new self(false, $messages, null);
    }

    public function toResponse(int $status = 200)
    {
        return response()->json([
            'success' => $this->success,
            'message' => $this->message,
            'data'    => $this->data,
        ], $status);
    }
}
