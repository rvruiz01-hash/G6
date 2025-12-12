<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeedbackMessage extends Model
{
    use HasFactory;
    protected $fillable = [
        'feedback_id',
        'user_id',
        'message',
        'attachments',
        'is_internal',
        'is_system',
        'read_at',
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_internal' => 'boolean',
        'is_system' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el feedback
     */
    public function feedback(): BelongsTo
    {
        return $this->belongsTo(Feedback::class);
    }

    /**
     * Relación con el usuario que envió el mensaje
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Marcar mensaje como leído
     */
    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Verificar si el mensaje ha sido leído
     */
    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    /**
     * Verificar si el usuario es admin
     */
    public function isFromAdmin(): bool
    {
        return $this->user && $this->user->is_admin;
    }

    /**
     * Scope para mensajes no leídos
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope para mensajes públicos (no internos)
     */
    public function scopePublic($query)
    {
        return $query->where('is_internal', false);
    }

    /**
     * Scope para mensajes internos
     */
    public function scopeInternal($query)
    {
        return $query->where('is_internal', true);
    }
}