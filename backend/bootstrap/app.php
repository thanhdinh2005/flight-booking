<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Exceptions\EntityNotFoundException;
use App\Exceptions\BusinessException;
use App\Exceptions\KeycloakException;
use App\Exceptions\HttpException;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Response\ApiResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->prepend(ForceJsonResponse::class);

        $middleware->alias([
            'role' => App\Http\Middleware\RequireRole::class,
            'auth.keycloak' => App\Http\Middleware\AuthenticateWithKeycloak::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $e) {
            if ($request->is('api/*')) {
                return true;
            }

            return $request->expectsJson();
        });

        $exceptions->render(function (ValidationException $e) {
            $messages = collect($e->errors())->flatten()->toArray();
            return ApiResponse::error($messages, 422);
        });

        $exceptions->render(function (AuthenticationException $e) {
            return ApiResponse::error($e->getMessage(), 401);
        });

        $exceptions->render(function (AuthorizationException $e) {
            return ApiResponse::error('Forbidden: You do not have permission', 403);
        });

        $exceptions->render(function (HttpException $e) {
            return ApiResponse::error($e->getMessage() ?: 'Something went wrong', $e->getStatusCode());
        });

        $exceptions->render(function (BusinessException $e) {
            return ApiResponse::error($e->getMessage(), 400);
        });

        $exceptions->render(function (EntityNotFoundException $e) {
            return ApiResponse::error($e->getMessage(), 404);
        });

        $exceptions->render(function (KeycloakException $e) {
            return ApiResponse::error("Identity Provider Error: " . $e->getMessage(), 502);
        });

        $exceptions->render(function (\Throwable $e) {
            $message = config('app.debug') ? $e->getMessage() : 'Internal Server Error';
            $status = 500;

            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                $status = $e->getStatusCode();
            }

            return ApiResponse::error($message, $status);
        });
    })->create();
