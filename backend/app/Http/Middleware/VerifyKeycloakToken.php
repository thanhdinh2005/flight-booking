<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\JWK;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Auth\AuthenticationException;
use App\Http\Response\ApiResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

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

            return json_decode(json_encode($decoded), true);

        } catch (ExpiredException $e) {
            throw new AuthenticationException('Token expired');

        } catch (SignatureInvalidException $e) {
            throw new AuthenticationException('Invalid token signature');

        } catch (\Throwable $e) {
            throw new AuthenticationException('Invalid token');
        }
    }

    // public function handle(Request $request, Closure $next)
    // {
    //     $token = $request->bearerToken();

    //     if (!$token) {
    //         return ApiResponse::error('Token not provided', 401);
    //     }

    //     try {
    //         $payload = $this->verify($token);

    //         if (!isset($payload['sub'])) {
    //             return ApiResponse::error('Invalid token structure', 401);
    //         }

    //         $request->attributes->add(['keycloak_id' => $payload['sub']]);

    //         return $next($request);

    //     } catch (\Exception $e) {
    //         throw new AuthenticationException($e->getMessage());
    //     }
    // }
}