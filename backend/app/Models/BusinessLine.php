<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessLine extends Model
{
    use HasFactory;

    // Nombre de la tabla (opcional si sigue convención, pero lo ponemos explícito)
    protected $table = 'business_lines';

    // Campos que se pueden asignar en masa
    protected $fillable = [
        'name',
        'status',
    ];

    // Casting de tipos de datos
    protected $casts = [
        'status' => 'boolean',
    ];

    // Relaciones
    public function positions()
    {
        return $this->hasMany(Position::class);
    }

    public function clientSites()
    {
        return $this->hasMany(ClientSite::class);
    }

   
}
