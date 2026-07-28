<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\RecordsNotFoundException;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class ExceptionNotifier
{
    /**
     * Only server-side failures (HTTP 5xx) are worth notifying.
     * Client errors (401, 403, 404, 419, 422, 429, ...) are expected traffic.
     */
    public static function shouldNotify(Throwable $e): bool
    {
        return static::statusCode($e) >= 500;
    }

    protected static function statusCode(Throwable $e): int
    {
        return match (true) {
            $e instanceof HttpExceptionInterface => $e->getStatusCode(),
            $e instanceof ValidationException => $e->status,
            $e instanceof AuthenticationException => 401,
            $e instanceof AuthorizationException => $e->status() ?? 403,
            $e instanceof TokenMismatchException => 419,
            $e instanceof RecordsNotFoundException => 404,
            default => 500,
        };
    }
}
