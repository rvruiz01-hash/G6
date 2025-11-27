<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FederalEntity extends Model
{
    use HasFactory;

    protected $table = 'federal_entities';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'id',
        'name',
        'abbreviation',
        'region_id',
    ];

     // Relaciones
    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function clientSites()
    {
        return $this->hasMany(ClientSite::class);
    }

    /**
     * Relación con municipios
     */
    public function municipalities(): HasMany
    {
        return $this->hasMany(Municipality::class, 'federal_entity_id', 'id');
    }

    /**
     * Relación con sucursales (si existe el modelo Branch)
     */
    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class, 'federal_entity_id', 'id');
    }

    /**
     * Obtener todas las colonias del estado a través de municipios
     */
    public function colonies(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(
            Colony::class,
            Municipality::class,
            'federal_entity_id', // Foreign key en municipalities
            'municipality_id',   // Foreign key en colonies
            'id',                // Local key en federal_entities
            'id'                 // Local key en municipalities
        );
    }

    /**
     * Scope para buscar por abreviación
     */
    public function scopeByAbbreviation($query, string $abbreviation)
    {
        return $query->where('abbreviation', strtoupper($abbreviation));
    }

    /**
     * Obtener cantidad de municipios del estado
     */
    public function getMunicipalitiesCountAttribute(): int
    {
        return $this->municipalities()->count();
    }

    /**
     * Obtener cantidad de colonias del estado
     */
    public function getColoniesCountAttribute(): int
    {
        return $this->colonies()->count();
    }
}