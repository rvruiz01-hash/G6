<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    /** @use HasFactory<\Database\Factories\PositionFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'level',
        'reports_to_position_id',
        'business_line_id',
        'department_id'
    ];

    protected $casts = [
        'level' => 'integer',
        'reports_to_position_id' => 'integer',
        'business_line_id' => 'integer',
        'department_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = ['subordinates_count'];
    
    public function department(){
        return $this->belongsTo(Department::class, 'department_id');
    }
    
    // Relaciones
    public function businessLine()
    {
        return $this->belongsTo(BusinessLine::class);
    }
    public function reportsTo()
    {
        return $this->belongsTo(Position::class, 'reports_to_position_id');
    }
        public function employees()
    {
        return $this->hasMany(Employee::class);
    }

       public function subordinates()
    {
        return $this->hasMany(Position::class, 'reports_to_position_id');
    }

     public function getSubordinatesCountAttribute()
    {
        return $this->subordinates()->count();
    }

     public function hasReportsTo()
    {
        return !is_null($this->reports_to_position_id);
    }

     public function hasSubordinates()
    {
        return $this->subordinates()->count() > 0;
    }

     public function getHierarchyPath()
    {
        $path = collect([$this]);
        $current = $this;

        while ($current->reportsTo) {
            $current = $current->reportsTo;
            $path->prepend($current);
        }

        return $path;
    }

     public function getAllSubordinates()
    {
        $subordinates = collect();

        foreach ($this->subordinates as $subordinate) {
            $subordinates->push($subordinate);
            $subordinates = $subordinates->merge($subordinate->getAllSubordinates());
        }

        return $subordinates;
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', '%' . $search . '%');
    }

     public function scopeByDepartment($query, $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

     public function scopeByBusinessLine($query, $businessLineId)
    {
        return $query->where('business_line_id', $businessLineId);
    }

     public function scopeTopLevel($query)
    {
        return $query->whereNull('reports_to_position_id');
    }

    public function scopeByLevel($query, $level)
    {
        return $query->where('level', $level);
    }

    protected static function boot()
    {
        parent::boot();

        // Prevent circular references in hierarchy
        static::saving(function ($position) {
            if ($position->reports_to_position_id) {
                // Can't report to itself
                if ($position->id && $position->reports_to_position_id == $position->id) {
                    throw new \Exception('Una posición no puede reportar a sí misma.');
                }

                // Prevent circular hierarchy
                if ($position->id) {
                    $supervisor = Position::find($position->reports_to_position_id);
                    if ($supervisor) {
                        $path = $supervisor->getHierarchyPath();
                        if ($path->contains('id', $position->id)) {
                            throw new \Exception('Se detectó una referencia circular en la jerarquía.');
                        }
                    }
                }
            }
        });

        // When deleting, update subordinates to remove the reference
        static::deleting(function ($position) {
            // Option 1: Set subordinates' reports_to to null
            $position->subordinates()->update(['reports_to_position_id' => null]);

            // Option 2: Prevent deletion if has subordinates (uncomment if preferred)
            // if ($position->subordinates()->count() > 0) {
            //     throw new \Exception('No se puede eliminar una posición que tiene subordinados.');
            // }
        });
    }
}
