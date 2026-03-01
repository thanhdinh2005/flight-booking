<?php

namespace App\Http\Response;

final class UserResponse
{
    public function __construct(
        public string $id,
        public string $keycloak_id,
        public string $email,
        public string $full_name,
        public string $role,
        public string $phone_number,
        public string $created_at,
    ) {}
}

