<?php

namespace App\Http\Middleware;


use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
class MiddlewareAllowExpiredToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
    {
        try {
            // Permite que el payload sea leído incluso si el token está expirado
            JWTAuth::parseToken()->getPayload();
        } catch (JWTException $e) {
            return response()->json(['error' => 'Token inválido o sesión expirada'], 401);
        }

        return $next($request);
    }
}
