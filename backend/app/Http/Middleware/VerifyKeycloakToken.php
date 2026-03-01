<?php

namespace App\Http\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\JWK;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

// Decode JWT, Catch error from firebase/php-jwt, Convert to AuthenticationException
class VerifyKeycloakToken
{
    public function verify(string $token): array
    {
        try {

            $jwks = Cache::remember('keycloak_jwks', 3600, function () {
                $response = Http::timeout(5)
                    ->get(config('keycloak.jwks_url'));

                if (!$response->ok()) {
                    throw new AuthenticationException('Unable to fetch JWKS');
                }

                return $response->json();
            });

            $decoded = JWT::decode(
                $token,
                JWK::parseKeySet($jwks)
            );

            return (array) $decoded;

        } catch (ExpiredException $e) {
            throw new AuthenticationException('Token expired');

        } catch (SignatureInvalidException $e) {
            throw new AuthenticationException('Invalid token signature');

        } catch (\Throwable $e) {
            throw new AuthenticationException('Invalid token');
        }
    }
}