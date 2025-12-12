<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Feedback extends Model
{
    use HasFactory;
    protected $table = 'feedback';
    protected $fillable = [
        'user_id',
        'module',
        'url',
        'type',
        'priority',
        'title',
        'description',
        'steps_to_reproduce',
        'expected_behavior',
        'actual_behavior',
        'frequency',
        'affected_users',
        'additional_info',
        'screenshots',
        'user_agent',
        'status',
        'rejected_notes',
        'resolved_by',
        'resolved_at',
        'resolution_description',
        'resolution_version',
        'time_to_resolve',
        'messages_count',
    ];

    protected $casts = [
        'screenshots' => 'array',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el usuario que reportó
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación con el usuario que resolvió
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * Relación con los mensajes del chat
     */
    public function messages()
    {
        return $this->hasMany(FeedbackMessage::class);
    }

    /**
     * Mensajes públicos (visibles para el usuario)
     */
    public function publicMessages()
    {
        return $this->hasMany(FeedbackMessage::class)->where('is_internal', false);
    }

    /**
     * Mensajes internos (solo para admins)
     */
    public function internalMessages()
    {
        return $this->hasMany(FeedbackMessage::class)->where('is_internal', true);
    }

    /**
     * Mensajes no leídos
     */
    public function unreadMessages()
    {
        return $this->hasMany(FeedbackMessage::class)->whereNull('read_at');
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope para filtrar por tipo
     */
    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope para filtrar por prioridad
     */
    public function scopePriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Obtener el ícono según el tipo
     */
    public function getIconAttribute(): string
    {
        return match($this->type) {
            'error' => '🐛',
            'improvement' => '💡',
            default => '📝',
        };
    }

    /**
     * Obtener el color según la prioridad
     */
    public function getPriorityColorAttribute(): string
    {
        return match($this->priority) {
            'low' => 'green',
            'medium' => 'yellow',
            'high' => 'red',
            default => 'gray',
        };
    }

    /**
     * Obtener el color según el estado
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'in_progress' => 'blue',
            'resolved' => 'green',
            'rejected' => 'red',
            default => 'gray',
        };
    }
}