<?php

namespace App\Http\Middleware;

use Closure;

class RequireRole
{
    public function handle($request, Closure $next, string $role)
    {
        $principal = $request->get('principal');
        $roles = $principal['realm_access']['roles'] ?? [];

        if (!in_array($role, $roles)) {
            abort(403);
        }

        return $next($request);
    }
}

