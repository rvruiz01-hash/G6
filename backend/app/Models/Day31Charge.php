<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Day31Charge extends Model
{
    use HasFactory;

    protected $table = 'day_31_charges';

    protected $fillable = [
        'percentage',
        'effective_date',
    ];

    protected $casts = [
        'percentage' => 'decimal:2',
        'effective_date' => 'date',
    ];
}