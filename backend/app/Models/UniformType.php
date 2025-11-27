<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UniformType extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'uniform_types';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'description',
        'body_part_id',
        'business_line_id',
        'sexe_id',
        'color_id',
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
     * Relación con BodyPart (Parte Corporal)
     * Un tipo de uniforme pertenece a una parte corporal
     */
    public function bodyPart(): BelongsTo
    {
        return $this->belongsTo(BodyPart::class, 'body_part_id');
    }

    /**
     * Relación con BusinessLine (Línea de Negocio)
     * Un tipo de uniforme pertenece a una línea de negocio
     */
    public function businessLine(): BelongsTo
    {
        return $this->belongsTo(BusinessLine::class, 'business_line_id');
    }

    /**
     * Relación con Sex (Sexo)
     * Un tipo de uniforme pertenece a un sexo
     */
    public function sexe(): BelongsTo
    {
        return $this->belongsTo(Sex::class, 'sexe_id');
    }

    /**
     * Relación con Color
     * Un tipo de uniforme pertenece a un color
     */
    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class, 'color_id');
    }
}