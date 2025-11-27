<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use App\Http\Middleware\EncryptCookies;
use App\Http\Middleware\RefreshJwtIfNeeded;
use App\Http\Middleware\UseJwtFromCookie;
use App\Http\Middleware\MiddlewareAllowExpiredToken;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Middleware GLOBAL (si se desea)
        $middleware->prepend(HandleCors::class);
        
        $middleware->alias([
            'refresh.token' => \App\Http\Middleware\RefreshJwtIfNeeded::class,
            'jwt.refresh' => \App\Http\Middleware\MiddlewareAllowExpiredToken::class,
        ]);

        // Middleware del grupo 'web'
        $middleware->group('web', [
            EncryptCookies::class,
        ]);

        // ✅ Middleware del grupo 'api'
    $middleware->group('api', [
        UseJwtFromCookie::class, // <- AÑADE ESTA LÍNEA
    ]);

        // Si quieres también puedes agregar HandleCors u otros middleware aquí
        // $middleware->prepend(HandleCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
