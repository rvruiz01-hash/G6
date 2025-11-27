<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Municipality extends Model
{
    use HasFactory;

    protected $table = 'municipalities';
    
    protected $fillable = [
        'federal_entity_id',
        'name',
    ];

    /**
     * Relación con la entidad federativa
     */
    public function federalEntity(): BelongsTo
    {
        return $this->belongsTo(FederalEntity::class, 'federal_entity_id', 'id');
    }

    /**
     * Relación con las colonias del municipio
     */
    public function colonies(): HasMany
    {
        return $this->hasMany(Colony::class, 'municipality_id', 'id');
    }

    /**
     * Relación con sucursales (si existe el modelo Branch)
     */
    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class, 'municipality_id', 'id');
    }
}