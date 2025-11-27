<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected $table = 'invoices';

    protected $fillable = [
        'folio',
        'supplier_id',
        'business_line_id',
        'payment_type',
        'payment_months',
        'subtotal',
        'iva',
        'total',
        'shipping_cost',        // ✅ NUEVO
        'freight_withholding',  // ✅ NUEVO
        'discount',             // ✅ NUEVO
        'federal_entity_id',
        'branch_id',
        'merchandise_paid',
        'invoice_paid',
        'invoice_file',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'iva' => 'decimal:2',
        'total' => 'decimal:2',
        'shipping_cost' => 'decimal:2',        // ✅ NUEVO
        'freight_withholding' => 'decimal:2',  // ✅ NUEVO
        'discount' => 'decimal:2',             // ✅ NUEVO
        'merchandise_paid' => 'boolean',
        'invoice_paid' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con Supplier (Proveedor)
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    /**
     * Relación con BusinessLine (Línea de Negocio)
     */
    public function businessLine(): BelongsTo
    {
        return $this->belongsTo(BusinessLine::class, 'business_line_id');
    }

    /**
     * Relación con FederalEntity (Entidad Federativa)
     */
    public function federalEntity(): BelongsTo
    {
        return $this->belongsTo(FederalEntity::class, 'federal_entity_id', 'id');
    }

    /**
     * Relación con Branch (Sucursal)
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    /**
     * Relación con UniformStock (Stock de Uniformes)
     * Una factura puede tener muchos uniformes
     */
    public function uniformStock(): HasMany
    {
        return $this->hasMany(UniformStock::class, 'invoice_id');
    }

    /**
     * Obtener la URL completa del archivo de factura
     */
    public function getInvoiceFileUrlAttribute(): ?string
    {
        if (!$this->invoice_file) {
            return null;
        }
        
        return route('invoice.file', ['filename' => basename($this->invoice_file)]);
    }

    /**
     * Verificar si tiene archivo adjunto
     */
    public function hasInvoiceFile(): bool
    {
        return !empty($this->invoice_file);
    }
}