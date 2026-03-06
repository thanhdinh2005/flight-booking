<?php

namespace App\Http\Middleware;

use App\Models\User;
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
            throw new AuthenticationException('Invalid token structure');
        }

        $keycloakId = $payload['sub'];

        $user = User::where('keycloak_id', $keycloakId)->first();

        if (!$user) {
            throw new AuthenticationException('User not found');
        }

        // attach payload
        $request->attributes->set('auth_user', $payload);

        // attach user cho $request->user()
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
