<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Uma extends Model
{
    use HasFactory;

    protected $table = 'umas';

    protected $fillable = [
        'year',
        'daily',
        'monthly',
        'annual',
    ];

    protected $casts = [
        'year' => 'integer',
        'daily' => 'decimal:2',
        'monthly' => 'decimal:2',
        'annual' => 'decimal:2',
    ];
}