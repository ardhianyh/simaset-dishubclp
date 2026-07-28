<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);

        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e) {
            // Only notify on server errors (5xx); client errors are expected traffic
            if (app()->environment('testing') || ! \App\Exceptions\ExceptionNotifier::shouldNotify($e)) {
                return;
            }

            app(\App\Services\TelegramNotificationService::class)->sendError(
                class_basename($e),
                $e->getMessage(),
                $e->getFile(),
                $e->getLine(),
                [
                    'request_method' => request()->method(),
                    'request_url' => request()->url(),
                    'request_path' => request()->path(),
                    'user_id' => auth()->id() ?? 'guest',
                ]
            );
        });
    })->create();
