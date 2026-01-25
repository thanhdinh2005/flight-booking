<?php

namespace App\Http\Middleware;

use Illuminate\Support\Facades\Http;
use Firebase\JWT\JWT;
use Firebase\JWT\JWK;

class VerifyKeycloakToken
{
    public function verify(string $token): array
    {
        $jwks = Http::get(config('keycloak.jwks_url'))->json();

        $decoded = JWT::decode(
            $token,
            JWK::parseKeySet($jwks),
        );

        return (array) $decoded;
    }
}
