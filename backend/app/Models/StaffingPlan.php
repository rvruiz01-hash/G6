<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffingPlan extends Model
{
    /** @use HasFactory<\Database\Factories\StaffingPlanFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'client_site_id',
        'status',
        'position_id',
        'quantity',
        'start_date',
        'end_date',
    ];

    // Relaciones
    public function clientSite()
    {
        return $this->belongsTo(ClientSite::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
