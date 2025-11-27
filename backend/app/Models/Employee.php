<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\belongsTo;
use Illuminate\Testing\Fluent\Concerns\Has;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'paternal_last_name',
        'maternal_last_name',
        'photo',
        'position_id',
        'email',
        'cellphone_number',
        'manager_id',
        'staffing_plan_id',
        'employee_status_id',
        'user_id',
    ];

     protected $casts = [
        'position_id' => 'integer',
        'manager_id' => 'integer',
        'staffing_plan_id' => 'integer',
    ];
    
    public function user(): belongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relaciones
    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function manager()
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function subordinates()
    {
        return $this->hasMany(Employee::class, 'manager_id');
    }

    public function staffingPlan()
    {
        return $this->belongsTo(StaffingPlan::class);
    }

    public function managedRegion()
    {
        return $this->hasOne(Region::class, 'regional_manager_id');
    }
}