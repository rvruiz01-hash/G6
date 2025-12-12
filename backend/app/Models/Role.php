<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'icono_svg',
        'status'
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    /**
     * Usuarios que tienen este rol
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'role_user')
                    ->using(RoleUser::class)
                    ->withPivot('is_primary')
                    ->withTimestamps();
    }

    /**
     * Módulos asociados a este rol
     */
    public function modules()
    {
        return $this->belongsToMany(Module::class, 'module_role', 'role_id', 'module_id')
                    ->withTimestamps();
    }

    /**
     * Scope para roles activos
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }
}
