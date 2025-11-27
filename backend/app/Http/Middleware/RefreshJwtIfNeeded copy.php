<?php

namespace App\Http\Middleware;

use Closure;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Cookie;

class RefreshJwtIfNeeded
{
    public function handle($request, Closure $next)
    {
        try {
            $user = JWTAuth::parseToken()->authenticate();
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido o expirado'], 401);
        }

        $payload = JWTAuth::parseToken()->getPayload();
        $exp = $payload->get('exp');
        $now = now()->timestamp;
        $timeLeft = $exp - $now;

        // Si queda menos de 10 minutos, refrescamos
        if ($timeLeft < 600) {
            $newToken = JWTAuth::refresh(JWTAuth::getToken());
            $ttl = config('jwt.ttl') * 60;
            $expiresAt = now()->addSeconds($ttl)->timestamp;

            $cookie = cookie(
                'access_token',
                $newToken,
                $ttl / 60,
                '/',
                null,
                false,
                true,
                false,
                'Strict'
            );

            $response = $next($request);
            return $response
                ->withCookie($cookie)
                ->header('X-Token-Expires-At', $expiresAt);
        }

        return $next($request);
    }
}
