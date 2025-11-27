<?php

namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;

class UseJwtFromCookie
{
    public function handle($request, Closure $next)
    {
        if (!$request->bearerToken() && $request->cookie('access_token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie('access_token'));
        }

        return $next($request);
    }
}
