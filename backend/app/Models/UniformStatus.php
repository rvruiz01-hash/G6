<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UniformStatus extends Model
{
    use HasFactory;

    protected $table = 'uniform_statuses';

    protected $fillable = [
        'description',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con UniformStock
     * Un estatus puede tener muchos uniformes
     */
    public function uniformStock(): HasMany
    {
        return $this->hasMany(UniformStock::class, 'uniform_status_id');
    }
}