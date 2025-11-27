<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sex extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

     public function sizes(): HasMany
    {
        return $this->hasMany(Size::class, 'sexe_id');
    }
}
