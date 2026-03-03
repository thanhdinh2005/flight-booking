<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;

// Get bearer token
class AuthenticateWithKeycloak
{
    public function __construct(
        protected VerifyKeycloakToken $verifyService
    ) {}

    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            throw new AuthenticationException('Token missing');
        }

        $payload = $this->verifyService->verify($token);

        if (!isset($payload['sub'])) {
            return response()->json(['message' => 'Invalid token: Missing Subject ID'], 401);
        }

        $request->attributes->set('keycloak_id', $payload['sub']);

        return $next($request);
    }
}
