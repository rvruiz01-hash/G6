<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HolidayDay extends Model
{
    use HasFactory;

    protected $table = 'holiday_days';

    protected $fillable = [
        'description',
        'date',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}