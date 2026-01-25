<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use App\Exceptions\HttpException;
use App\Http\Response\ApiResponse;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => App\Http\Middleware\RequireRole::class,
            'auth.keycloak' => App\Http\Middleware\AuthenticateWithKeycloak::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions -> render(function (HttpException $e, Request $request) {
            return response()->json([
                'error' => $e->error(),
                'message' => $e->getMessage(),
            ], $e->status());
        });

        $exceptions->render(function (ValidationException $e) {
            return ApiResponse::errorList(
                collect($e->errors())->flatten()->toArray()
            )->toResponse(409);
        });
    })->create();
