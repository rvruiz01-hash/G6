<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

     protected $fillable = [
        'name',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function positions()
    {
        return $this->hasMany(Position::class, 'department_id');
    }
    public function getPositionsCountAttribute()
    {
        return $this->positions()->count();
    }
    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', '%' . $search . '%');
    }
    protected static function boot()
    {
        parent::boot();

        // Prevent deletion if department has positions
        static::deleting(function ($department) {
            if ($department->positions()->count() > 0) {
                throw new \Exception('No se puede eliminar un departamento que tiene posiciones asignadas.');
            }
        });
    }
}