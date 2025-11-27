<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seniority extends Model
{
    use HasFactory;

    protected $table = 'seniorities';

    protected $fillable = [
        'years',
        'vacation_days',
        'vacation_premium_percentage',
        'seniority_days',
        'christmas_bonus_days',
    ];

    protected $casts = [
        'years' => 'integer',
        'vacation_days' => 'integer',
        'vacation_premium_percentage' => 'integer',
        'seniority_days' => 'integer',
        'christmas_bonus_days' => 'integer',
    ];
}