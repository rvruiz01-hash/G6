<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    use HasFactory;

    protected $table = 'salaries';

    protected $fillable = [
        'effective_date',
        'area_a',
        'area_b',
        'area_c',
    ];

    protected $casts = [
        'effective_date' => 'date',
        'area_a' => 'decimal:2',
        'area_b' => 'decimal:2',
        'area_c' => 'decimal:2',
    ];
}