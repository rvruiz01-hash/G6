<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\JWTException;

class RefreshJwtIfNeeded
{
    // umbral en segundos antes de expirar para forzar refresh (10 minutos)
    protected int $threshold = 600;

    public function handle(Request $request, Closure $next)
    {
        // 1) obtener token (Bearer o cookie)
        $token = $request->bearerToken() ?? $request->cookie('access_token');

        if (! $token) {
            return response()->json(['error' => 'Token no proporcionado'], 401);
        }

        // 2) validar/leer payload
        try {
            JWTAuth::setToken($token)->authenticate();
        } catch (TokenExpiredException $e) {
            // Si expiró, intentamos refresh inmediato (solo si está dentro del refresh_ttl)
            try {
                $newToken = JWTAuth::refresh($token);
                return $this->attachTokenAndContinue($request, $next, $newToken);
            } catch (JWTException $e) {
                return response()->json(['error' => 'Sesión expirada, reingrese'], 401);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token inválido'], 401);
        }

        // 3) token válido: comprobar cuánto tiempo queda
        try {
            $payload = JWTAuth::setToken($token)->getPayload();
            $exp = $payload->get('exp');
            $now = now()->timestamp;
            $timeLeft = $exp - $now;
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo leer token'], 401);
        }

        // 4) si queda menos que threshold -> refrescar y devolver cookie nueva
        if ($timeLeft < $this->threshold) {
            try {
                $newToken = JWTAuth::refresh($token);
                return $this->attachTokenAndContinue($request, $next, $newToken);
            } catch (JWTException $e) {
                // no pudo refrescar
                return response()->json(['error' => 'No se pudo refrescar token'], 401);
            }
        }

        // 5) todo ok, continuar
        return $next($request);
    }

    protected function attachTokenAndContinue(Request $request, Closure $next, string $newToken)
    {
        $ttlMinutes = (int) config('jwt.ttl', 30);
        $ttlSeconds = $ttlMinutes * 60;
        $expiresAt = now()->addSeconds($ttlSeconds)->timestamp;
        $secure = config('app.env') !== 'local';

        $cookie = cookie(
            'access_token',
            $newToken,
            $ttlMinutes,
            '/',
            null,
            $secure,
            true,
            false,
            'Lax'
        );

        $response = $next($request);
        return $response->withCookie($cookie)
                        ->header('X-Token-Expires-At', $expiresAt);
    }
}
