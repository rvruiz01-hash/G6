<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UniformStatus;

class UniformStatusSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = [
            ['id' => 1, 'description' => 'EN STOCK'],
            ['id' => 2, 'description' => 'ASIGNADO'],
            ['id' => 3, 'description' => 'EN LAVANDERÍA'],
            ['id' => 4, 'description' => 'DADO DE BAJA'],
        ];

        foreach ($statuses as $status) {
            UniformStatus::updateOrCreate(
                ['id' => $status['id']],
                $status
            );
        }
    }
}