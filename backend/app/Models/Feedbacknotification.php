<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class FeedbackNotification extends Model
{
    protected $fillable = [
        'feedback_id',
        'role_id',
        'type',
        'message',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
    ];

    // Relación con Feedback
    public function feedback()
    {
        return $this->belongsTo(Feedback::class);
    }

    // Relación con Role
    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    // 🎯 Relación con usuarios que han leído esta notificación
    public function readByUsers()
    {
        return $this->belongsToMany(User::class, 'feedback_notification_reads', 'notification_id', 'user_id')
                    ->withPivot('read_at')
                    ->withTimestamps();
    }

    // Scope para filtrar por role
    public function scopeForRole($query, $roleId)
    {
        return $query->where('role_id', $roleId);
    }

    // 🎯 Verificar si un usuario específico ha leído esta notificación
    public function isReadBy($userId)
    {
        return $this->readByUsers()->where('user_id', $userId)->exists();
    }

    // 🎯 Marcar como leída por un usuario específico
    public function markAsReadBy($userId)
    {
        if (!$this->isReadBy($userId)) {
            $this->readByUsers()->attach($userId, ['read_at' => now()]);
        }
    }
}