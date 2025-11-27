<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Colony extends Model
{
    use HasFactory;

    protected $table = 'colonies';
    
    protected $fillable = [
        'municipality_id',
        'name',
        'postal_code',
    ];

    /**
     * Relación con el municipio
     */
    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipality_id', 'id');
    }

    /**
     * Obtener la entidad federativa a través del municipio
     */
    public function federalEntity(): BelongsTo
    {
        return $this->municipality->federalEntity();
    }

    /**
     * Relación con sucursales (si existe el modelo Branch)
     */
    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class, 'colony_id', 'id');
    }

    /**
     * Scope para buscar por código postal
     */
    public function scopeByPostalCode($query, string $postalCode)
    {
        return $query->where('postal_code', $postalCode);
    }

    /**
     * Scope para buscar por municipio
     */
    public function scopeByMunicipality($query, int $municipalityId)
    {
        return $query->where('municipality_id', $municipalityId);
    }

    /**
     * Obtener el nombre completo de la dirección
     */
    public function getFullAddressAttribute(): string
    {
        return sprintf(
            '%s, %s, %s, C.P. %s',
            $this->name,
            $this->municipality->name,
            $this->municipality->federalEntity->name,
            $this->postal_code
        );
    }
}