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

        $request->attributes->set('auth_user', $payload);

        return $next($request);
    }
}
