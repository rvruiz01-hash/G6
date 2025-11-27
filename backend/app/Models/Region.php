<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    /** @use HasFactory<\Database\Factories\RegionFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'regional_manager_id',
    ];

    protected $casts = [
        'regional_manager_id' => 'integer'
    ];
    // Relaciones
    public function regionalManager()
    {
        return $this->belongsTo(Employee::class, 'regional_manager_id');
    }

    public function federalEntities()
    {
        return $this->hasMany(FederalEntity::class);
    }
}
