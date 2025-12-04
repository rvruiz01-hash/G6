<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only(['email', 'password']);

        if (! $token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Credenciales inválidas'], 401);
        }

        $user = auth('api')->user(); // Esto puede ser null aquí, probemos alternativa:
        $user = \App\Models\User::select('id', 'name', 'email')
                ->with(['employee' => function ($query) {$query
                ->select('user_id','photo');
                }])
                ->where('email', $request->email)->first();
       
        // Convertimos a colección y aplanamos
        $result = collect($user
                    ->toArray())
                    ->merge($user->employee->toArray())
                    ->except('employee'); // eliminamos el objeto employee

        return $this->respondWithToken($token, $result);
    }

public function logout()
{
    try {
        // ✅ Usar valores de config/cookie.php
        $cookie = cookie(
            'access_token',
            null,
            -1,
            '/',
            config('cookie.domain'),      // ← CAMBIO AQUÍ
            config('cookie.secure'),      // ← CAMBIO AQUÍ
            true,
            false,
            config('cookie.same_site')    // ← CAMBIO AQUÍ
        );
        
        return response()->json(['message' => 'Sesión cerrada'])
                         ->withCookie($cookie);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
}

    // app/Http/Controllers/Api/AuthController.php

// ... (tus demás funciones)

public function refresh()
{
    // El middleware de JWTAuth manejará la extracción y validación del token
    // de la cabecera de Authorization. No es necesario extraerlo manualmente aquí.
    
    try {
        $newToken = JWTAuth::refresh();
    } catch (\Tymon\JWTAuth\Exceptions\TokenInvalidException $e) {
        return response()->json(['error' => 'Token inválido o expirado'], 401);
    } catch (\Exception $e) {
        return response()->json(['error' => 'No se pudo refrescar el token'], 401);
    }

    return $this->respondWithToken($newToken);
}

    public function me()
    {
        // Traemos el usuario autenticado
        $user = auth('api')->user();

        if (!$user) {
            return response()->json(null, 401);
        }

        // Traemos la relación employee y seleccionamos solo el campo photo
        $userWithPhoto = \App\Models\User::select('id', 'name', 'email')
            ->with(['employee' => function ($query) {
                $query->select('user_id', 'photo');
            }])
            ->where('id', $user->id)
            ->first();

        // Aplanamos la relación employee para que no venga anidada
        $result = collect($userWithPhoto->toArray())
            ->merge($userWithPhoto->employee->toArray())
            ->except('employee');

        return response()->json($result);
    }


protected function respondWithToken(string $token, $user = null)
{
    $ttlMinutes = (int) config('jwt.ttl', 30);
    $ttlSeconds = $ttlMinutes * 60;
    $expiresAt = now()->addSeconds($ttlSeconds)->timestamp;

    // ✅ Usar valores de config/cookie.php
    $cookie = cookie(
        'access_token',
        $token,
        $ttlMinutes,
        '/',
        config('cookie.domain'),      // ← CAMBIO AQUÍ
        config('cookie.secure'),      // ← CAMBIO AQUÍ
        true,                         // httpOnly: siempre true
        false,
        config('cookie.same_site')    // ← CAMBIO AQUÍ
    );

    return response()->json([
        'token_type'   => 'bearer',
        'expires_in'   => $ttlSeconds,
        'expires_at'   => $expiresAt,
        'user'         => $user,
    ])->withCookie($cookie)
      ->header('X-Token-Expires-At', $expiresAt);
}
}