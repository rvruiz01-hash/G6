<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonthlyIsr extends Model
{
    use HasFactory;

    protected $table = 'monthly_isr';

    protected $fillable = [
        'lower_limit',
        'upper_limit',
        'fixed_fee',
        'excess_percentage',
    ];

    protected $casts = [
        'lower_limit' => 'decimal:2',
        'upper_limit' => 'decimal:2',
        'fixed_fee' => 'decimal:2',
        'excess_percentage' => 'decimal:2',
    ];
}