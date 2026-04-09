<?php

namespace App\Providers;

use App\Listeners\LogAuthEvent;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Event::listen(Login::class, [LogAuthEvent::class, 'handleLogin']);
        Event::listen(Logout::class, [LogAuthEvent::class, 'handleLogout']);
        Event::listen(Failed::class, [LogAuthEvent::class, 'handleFailed']);
    }
}
