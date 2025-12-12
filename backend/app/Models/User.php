<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

//relaciones para empleados
use App\Models\Employee;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the identifier that will be stored in the JWT token.
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Get the custom claims that will be added to the JWT token.
     */
    public function getJWTCustomClaims(): array
    {
        return [];
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

     /**
     * Get the employee associated with the user.
     */
    public function employee(): HasOne
    {
        return $this->hasOne(Employee::class);
    }

    /**
     * Get user's full name from employee profile.
     */
    public function getFullNameAttribute(): ?string
    {
        return $this->employee?->full_name ?? $this->name;
    }

    /**
     * Get user's photo from employee profile.
     */
    public function getPhotoAttribute(): string
    {
        return $this->employee?->photo ?? asset('images/user/default-avatar.jpg');//si no se manda el Accesor photo, manda una foto por defecto
    }

    /**
        * Roles del usuario
    */
    public function roles()
    {
        return $this->belongsToMany(Role::class)
        ->using(RoleUser::class)
        ->withPivot('is_primary')
        ->withTimestamps();
    }

    public function isAdmin(): bool
    {
        // Verifica si tiene el rol con ID 1 (Administrador)
        return $this->roles()->where('role_id', 1)->exists();
    }

    /**
     * Obtener el rol principal del usuario
     */
    public function primaryRole()
    {
        return $this->belongsToMany(Role::class)
                    ->withPivot('is_primary')
                    ->wherePivot('is_primary', true)
                    ->first();
    }

    /**
     * 🎯 ACCESSOR PARA COMPATIBILIDAD CON FRONTEND
     * Permite usar $user->is_admin en el código
     */
    public function getIsAdminAttribute(): bool
    {
        return $this->isAdmin();
    }

    /**
     * Establecer un rol como principal
     */
    public function setPrimaryRole($roleId)
    {
        // Verificar que el usuario tenga ese rol
        if (!$this->roles->contains($roleId)) {
            throw new \Exception('El usuario no tiene ese rol asignado');
        }

        // Quitar el flag de principal a todos los roles
        $this->roles()->updateExistingPivot(
            $this->roles->pluck('id')->toArray(),
            ['is_primary' => false]
        );

        // Establecer el nuevo rol como principal
        $this->roles()->updateExistingPivot($roleId, ['is_primary' => true]);

        return $this->fresh();
    }

    /**
     * Asignar rol y opcionalmente marcarlo como principal
     */
    public function assignRole($roleId, $isPrimary = false)
    {
        // Si ya tiene el rol, no hacer nada
        if ($this->roles->contains($roleId)) {
            if ($isPrimary) {
                return $this->setPrimaryRole($roleId);
            }
            return $this;
        }
        // Si es principal, quitar el flag de los demás
        if ($isPrimary) {
            $this->roles()->updateExistingPivot(
                $this->roles->pluck('id')->toArray(),
                ['is_primary' => false]
            );
        }
        // Asignar el nuevo rol
        $this->roles()->attach($roleId, ['is_primary' => $isPrimary]);

        return $this->fresh();
    }

    /**
     * Verificar si tiene un rol específico
     */
    public function hasRole($roleName)
    {

        if (is_numeric($roleName)) {
            return $this->roles()->where('role_id', $roleName)->exists();
        }

        return $this->roles()->where('name', $roleName)->exists();
    }

    /**
     * Verificar si el rol principal es el especificado
     */
    public function isPrimaryRole($roleName)
    {
        $primaryRole = $this->primaryRole();
        return $primaryRole && $primaryRole->name === $roleName;
    }
    
}