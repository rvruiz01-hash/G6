<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'icon_svg',
        'status',
        'path',
        'parent_id', // para submódulos
    ];

    /**
     * Relación muchos a muchos con roles
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'module_role', 'module_id', 'role_id')
                    ->withTimestamps();
    }

    /**
     * Submódulos (si los hay)
     */
    public function subModules()
    {
        return $this->hasMany(Module::class, 'parent_id');
    }

    /**
     * Módulo padre
     */
    public function parent()
    {
        return $this->belongsTo(Module::class, 'parent_id');
    }
}
