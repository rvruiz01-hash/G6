<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BodyPart extends Model
{
    //
    protected $table = 'body_parts';

    protected $fillable = [
        'description',
    ];

    protected $casts = [
    ];
    public function sizes(): HasMany
    {
        return $this->hasMany(Size::class, 'body_part_id');
    }

}
