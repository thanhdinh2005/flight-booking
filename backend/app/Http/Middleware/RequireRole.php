<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Auth\Access\AuthorizationException;

class RequireRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        $user = $request->attributes->get('auth_user');

        if (!$user) {
            throw new AuthorizationException('Unauthorized');
        }

        $roles = $user['realm_access']['roles'] ?? [];

        if (!in_array($role, $roles)) {
            throw new AuthorizationException('Forbidden');
        }

        return $next($request);
    }
}
