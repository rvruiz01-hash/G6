<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'folio',
        'business_line_id',
        'shift_type_id',
        'federal_entity_id',
        'net_salary',
        'total_elements',
        'total_rest_days',
        'has_holidays',
        'has_day_31',
        'monthly_salary',
        'total_benefits',
        'total_social_charge',
        'state_tax',
        'total_cost_per_guard',
        'uniform_cost',
        'sale_cost_without_financing',
        'financing',
        'utility',
        'sale_price',
        'breakdown',
        'uniforms',
    ];

    protected $casts = [
        'net_salary' => 'decimal:2',
        'monthly_salary' => 'decimal:2',
        'total_benefits' => 'decimal:2',
        'total_social_charge' => 'decimal:2',
        'state_tax' => 'decimal:2',
        'total_cost_per_guard' => 'decimal:2',
        'uniform_cost' => 'decimal:2',
        'sale_cost_without_financing' => 'decimal:2',
        'financing' => 'decimal:2',
        'utility' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'has_holidays' => 'boolean',
        'has_day_31' => 'boolean',
        'breakdown' => 'array',
        'uniforms' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function businessLine(): BelongsTo
    {
        return $this->belongsTo(BusinessLine::class);
    }

    public function shiftType(): BelongsTo
    {
        return $this->belongsTo(ShiftType::class);
    }

    public function federalEntity(): BelongsTo
    {
        return $this->belongsTo(FederalEntity::class, 'federal_entity_id', 'id');
    }

    public static function generateFolio(): string
    {
        $year = date('Y');
        $month = date('m');
        $lastQuotation = self::whereYear('created_at', $year)
                             ->whereMonth('created_at', $month)
                             ->orderBy('id', 'desc')
                             ->first();
        
        $consecutive = $lastQuotation ? (int)substr($lastQuotation->folio, -4) + 1 : 1;
        
        return sprintf('COT-%s%s-%04d', $year, $month, $consecutive);
    }
}