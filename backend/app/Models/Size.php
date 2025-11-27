<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Size extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'sizes';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'description',
        'sexe_id',
        'body_part_id',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con BusinessLine (Línea de Negocio)
     * Una talla pertenece a una línea de negocio
     */
    public function sexe(): BelongsTo
    {
        return $this->belongsTo(Sex::class, 'sexe_id');
    }

    /**
     * Relación con BodyPart (Parte Corporal)
     * Una talla pertenece a una parte corporal
     */
    public function bodyPart(): BelongsTo
    {
        return $this->belongsTo(BodyPart::class, 'body_part_id');
    }
}