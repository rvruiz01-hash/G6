<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Support\Facades\DB;

class RoleUser extends Pivot
{
    protected $table = 'role_user';

    protected $fillable = [
        'user_id',
        'role_id',
        'is_primary',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    /**
     * Relación hacia User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación hacia Role
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Evitar que un usuario tenga más de un rol principal.
     */
    protected static function booted()
    {
        static::saving(function ($pivot) {
            if ($pivot->is_primary) {
                // Poner is_primary = false a cualquier otro rol principal del mismo usuario
                DB::table('role_user')
                    ->where('user_id', $pivot->user_id)
                    ->where('is_primary', true)
                    ->where('role_id', '<>', $pivot->role_id) // excluir el que se está guardando
                    ->update(['is_primary' => false]);
            }
        });
    }
}
