<?php

namespace App\Http\Middleware;

use Closure;

class AuthenticateWithKeycloak
{
    public function handle($request, Closure $next)
    {
        $token = $request->bearerToken();
        if (!$token) abort(401);

        $payload = app(VerifyKeycloakToken::class)->verify($token);

        $request->attributes->set('principal', $payload);

        return $next($request);
    }
}
