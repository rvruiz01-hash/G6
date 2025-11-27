<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkRiskPremium extends Model
{
    use HasFactory;

    protected $table = 'work_risk_premiums';

    protected $fillable = [
        'registration_id',
        'year',
        'month',
        'amount',
    ];

    protected $casts = [
        'year' => 'integer',
        'amount' => 'decimal:4',
    ];
}