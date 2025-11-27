<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Tymon\JWTAuth\Facades\JWTAuth;


class AuthController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('auth:api', except: ['register', 'login']),
        ];
    }
    
    public function login()
    {
        $credentials = request(['email', 'password']);

        if (! $token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'No autorizado'], 401);
        }
        return $this->respondWithTokens($token);
    }

    public function refresh()
    {
        $newToken = JWTAuth::refresh(JWTAuth::getToken());

        return $this->respondWithTokens($newToken);
    }
    public function me()
    {
        return response()->json(auth('api')->user());
    }


    

    protected function respondWithTokens($token)
{
    $ttl = config('jwt.ttl') * 60; // segundos
    $expiresAt = now()->addSeconds($ttl)->timestamp;

    // Seteamos cookie HttpOnly con el access_token
    $cookie = cookie(
        'access_token',     // nombre
        $token,             // valor
        $ttl / 60,          // minutos
        '/',                // path
        null,               // dominio (null = actual)
        false,              // secure (pon en true si usas HTTPS)
        true,               // httpOnly
        false,              // raw
        'Strict'            // SameSite (usa 'Lax' si necesitas menos restrictivo)
    );

    return response()->json([
        'user' => auth('api')->user(),
        'expires_at' => $expiresAt // timestamp UNIX
    ])->withCookie($cookie);
}



}