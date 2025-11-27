<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImssConcept extends Model
{
    use HasFactory;

    protected $table = 'imss_concepts';

    protected $fillable = [
        'description',
        'type',
        'employer_percentage',
        'worker_percentage',
        'total_percentage',
        'calculation_base',
        'regulatory_framework',
    ];
}