<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClientSite extends Model
{
    /** @use HasFactory<\Database\Factories\ClientSiteFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'client_id',
        'business_line_id',
        'status',
        'federal_entity_id',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'business_line_id' => 'integer'
    ];
    
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function businessLine(): BelongsTo
    {
        return $this->belongsTo(BusinessLine::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'supervisor_id');
    }

    public function federalEntity()
    {
        return $this->belongsTo(FederalEntity::class);
    }

    public function staffingPlans(): HasMany
    {
        return $this->hasMany(StaffingPlan::class);
    }

    
}
