<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Position;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Position::insert([
            // ===== Seguridad Física =====
            [ 'name' => 'Director General', 'level' => 1, 'reports_to_position_id' => null, 'business_line_id' => 1 ],
            [ 'name' => 'Director de Operaciones','level' => 2, 'reports_to_position_id' => 1,    'business_line_id' => 1 ],
            [ 'name' => 'Director de TI', 'level' => 2, 'reports_to_position_id' => 1,    'business_line_id' => 1 ],
            [ 'name' => 'Director de RRHH', 'level' => 2, 'reports_to_position_id' => 1,    'business_line_id' => 1 ],
            [ 'name' => 'Gerente Nacional', 'level' => 3, 'reports_to_position_id' => 2,    'business_line_id' => 1 ],
            [ 'name' => 'Gerente Regional', 'level' => 4, 'reports_to_position_id' => 5,    'business_line_id' => 1 ],
            [ 'name' => 'Supervisor', 'level' => 5, 'reports_to_position_id' => 6,    'business_line_id' => 1 ],
            [ 'name' => 'Guardia', 'level' => 6, 'reports_to_position_id' => 7,    'business_line_id' => 1 ],

            // ===== Seguridad Electrónica =====
            [ 'name' => 'Director General Electrónica', 'level' => 1, 'reports_to_position_id' => null, 'business_line_id' => 2 ],
            [ 'name' => 'Gerente de Instalaciones',     'level' => 2, 'reports_to_position_id' => 9,   'business_line_id' => 2 ],
            [ 'name' => 'Técnico Electrónico',          'level' => 3, 'reports_to_position_id' => 10,   'business_line_id' => 2 ],
        ]);
    }
}
