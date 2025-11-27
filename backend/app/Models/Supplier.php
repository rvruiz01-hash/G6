<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Supplier extends Model
{
    use HasFactory;

    protected $table = 'suppliers';

    protected $fillable = [
        'contractor_number',
        'legal_name',
        'trade_name',
        'rfc',
        'contact_person',
        'contact_number',
        'email',
        'phone',
        'website',
        'bank_id',
        'account_number',
        'clabe',
        'fiscal_address',
        'postal_code',
        'federal_entity_id',
        'municipalities_id',  // ✅ CORREGIDO: era 'municipalities'
        'colonies_id',        // ✅ CORREGIDO: era 'colonies'
        'notes',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con Bank (Banco)
     */
    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class, 'bank_id');
    }

    /**
     * Relación con FederalEntity (Estado/Entidad Federativa)
     */
    public function federalEntity(): BelongsTo
    {
        return $this->belongsTo(FederalEntity::class, 'federal_entity_id', 'id');
    }

    /**
     * Relación con Municipality (Municipio)
     */
    public function municipality(): BelongsTo
    {
        return $this->belongsTo(Municipality::class, 'municipalities_id', 'id');
    }

    /**
     * Relación con Colony (Colonia)
     */
    public function colony(): BelongsTo
    {
        return $this->belongsTo(Colony::class, 'colonies_id', 'id');
    }

    /**
     * Obtener dirección completa formateada
     */
    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->fiscal_address,
            $this->colony?->name,
            $this->municipality?->name,
            $this->federalEntity?->name,
            $this->postal_code ? "C.P. {$this->postal_code}" : null,
        ]);

        return implode(', ', $parts);
    }

    /**
     * Scope para proveedores activos
     */
    public function scopeActive($query)
    {
        return $query->where('status', true);
    }

    /**
     * Scope para buscar por RFC
     */
    public function scopeByRfc($query, string $rfc)
    {
        return $query->where('rfc', strtoupper($rfc));
    }
}