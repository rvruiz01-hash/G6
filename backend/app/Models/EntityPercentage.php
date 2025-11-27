<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EntityPercentage extends Model
{
    use HasFactory;

    protected $table = 'entity_percentages';

    protected $fillable = [
        'percentage',
        'federal_entity_id',
        'business_line_id',
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
    ];

    /**
     * Relación con FederalEntity
     */
    public function federalEntity(): BelongsTo
    {
        return $this->belongsTo(FederalEntity::class, 'federal_entity_id', 'id');
    }

    /**
     * Relación con BusinessLine
     */
    public function businessLine(): BelongsTo
    {
        return $this->belongsTo(BusinessLine::class, 'business_line_id');
    }
}