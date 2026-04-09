<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Log;

class LogAuthEvent
{
    public function handleLogin(Login $event): void
    {
        $user = $event->user;
        $ip = request()->ip();
        $ua = request()->userAgent();

        activity('auth')
            ->causedBy($user)
            ->withProperties([
                'ip' => $ip,
                'user_agent' => $ua,
                'action' => 'login',
            ])
            ->log("User {$user->name} logged in from {$ip}");

        Log::info("Auth: Login success", [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $ip,
        ]);
    }

    public function handleLogout(Logout $event): void
    {
        $user = $event->user;

        if (! $user) {
            return;
        }

        $ip = request()->ip();

        activity('auth')
            ->causedBy($user)
            ->withProperties([
                'ip' => $ip,
                'action' => 'logout',
            ])
            ->log("User {$user->name} logged out");

        Log::info("Auth: Logout", [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $ip,
        ]);
    }

    public function handleFailed(Failed $event): void
    {
        $ip = request()->ip();
        $ua = request()->userAgent();
        $email = $event->credentials['email'] ?? 'unknown';

        activity('auth')
            ->withProperties([
                'ip' => $ip,
                'user_agent' => $ua,
                'email' => $email,
                'action' => 'failed_login',
            ])
            ->log("Failed login attempt for {$email} from {$ip}");

        Log::warning("Auth: Failed login attempt", [
            'email' => $email,
            'ip' => $ip,
        ]);
    }
}
