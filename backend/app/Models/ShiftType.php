<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShiftType extends Model
{
    use HasFactory;

    protected $table = 'shift_types';

    protected $fillable = [
        'name',
        'business_line_id',
        'total_rest_days',
    ];

    protected $casts = [
        'total_rest_days' => 'integer',
    ];

    /**
     * Relación con BusinessLine
     */
    public function businessLine(): BelongsTo
    {
        return $this->belongsTo(BusinessLine::class, 'business_line_id');
    }
}