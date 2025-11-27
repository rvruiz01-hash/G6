<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BusinessLineSeeder extends Seeder
{
    public function run()
    {
        DB::table('business_lines')->insert([
            [
                'name' => 'SEGURIDAD FÍSICA',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SEGURIDAD ELECTRÓNICA',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SEGURIDAD SATELITAL',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'ESCOLTAS Y PROTECCIÓN EJECUTIVA',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'CONSULTORÍA Y EVALUACIÓN DE RIESGOS',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SEGURIDAD INDUSTRIAL',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
