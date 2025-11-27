<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UniformStock extends Model
{
    use HasFactory;

    protected $table = 'uniform_stock';

    protected $fillable = [
        'invoice_id',
        'uniform_type_id',
        'size_id',
        'color_id',
        'code',
        'quantity',
        'unit_price',
        'subtotal',
        'uniform_status_id',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con Invoice (Factura)
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    /**
     * Relación con UniformType (Tipo de Uniforme)
     */
    public function uniformType(): BelongsTo
    {
        return $this->belongsTo(UniformType::class, 'uniform_type_id');
    }

    /**
     * Relación con Size (Talla)
     */
    public function size(): BelongsTo
    {
        return $this->belongsTo(Size::class, 'size_id');
    }

        public function color(): BelongsTo
{
    return $this->belongsTo(Color::class, 'color_id');
}

    /**
     * Relación con UniformStatus (Estatus)
     */
    public function uniformStatus(): BelongsTo
    {
        return $this->belongsTo(UniformStatus::class, 'uniform_status_id');
    }

    


}