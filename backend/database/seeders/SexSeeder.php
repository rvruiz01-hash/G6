<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Sex;

class SexSeeder extends Seeder
{
    public function run(): void
    {
        $sexes = [
            ['name' => 'FEMENINO'],
            ['name' => 'MASCULINO'],
            ['name' => 'AMBOS'] // ✅ Nueva opción
        ];

        Sex::insert($sexes);
    }
}