<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ImssConceptSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('imss_concepts')->insert([
            ['description' => 'Riesgo de trabajo', 'type' => 'En especie y en dinero', 'employer_percentage' => 'Prima de riesgo vigente de la empresa', 'worker_percentage' => '0.000%', 'total_percentage' => 'Prima de riesgos vigente de la empresa', 'calculation_base' => 'SBC', 'regulatory_framework' => 'LSS (Articulo 71)'],
            ['description' => 'Enfermedades y maternidad', 'type' => 'Cuota fija', 'employer_percentage' => '20.400%', 'worker_percentage' => '0.000%', 'total_percentage' => '20.400%', 'calculation_base' => 'UMA', 'regulatory_framework' => 'LSS(Articulo 106 Fraccion II Decimo Noveno Transit'],
            ['description' => 'Enfermedades y maternidad', 'type' => 'Aplicacion al excedente de 3 umas', 'employer_percentage' => '1.100%', 'worker_percentage' => '0.400%', 'total_percentage' => '1.500%', 'calculation_base' => 'SBC-(3*UMA)', 'regulatory_framework' => 'LSS(Articulo 106 Fraccion II y Decimonoveno)'],
            ['description' => 'Enfermedades y maternidad', 'type' => 'Prestaciones en dinero', 'employer_percentage' => '0.7000%', 'worker_percentage' => '0.250%', 'total_percentage' => '0.950%', 'calculation_base' => 'SBC', 'regulatory_framework' => 'LSS (Articulo 107 Fraccion I y II'],
            ['description' => 'Enfermedades y maternidad', 'type' => 'Gastos médicos Pensionados', 'employer_percentage' => '1.050%', 'worker_percentage' => '0.375%', 'total_percentage' => '1.425%', 'calculation_base' => 'SBC', 'regulatory_framework' => 'LSS (Artículo 25)'],
            ['description' => 'Invalidez y vida', 'type' => 'En dinero', 'employer_percentage' => '1.750%', 'worker_percentage' => '0.625%', 'total_percentage' => '2.375%', 'calculation_base' => 'SBC', 'regulatory_framework' => 'LSS (Artículo 147)'],
            ['description' => 'Retiro', 'type' => 'En dinero', 'employer_percentage' => '2.000%', 'worker_percentage' => '0.000%', 'total_percentage' => '2.000%', 'calculation_base' => 'SBC', 'regulatory_framework' => 'LSS (Artículo 168, Fracción I)'],
            ['description' => 'Cesantía en edad avanzada y vejez', 'type' => 'En dinero', 'employer_percentage' => '4.882%', 'worker_percentage' => '1.125%', 'total_percentage' => '6.007%', 'calculation_base' => 'SBC', 'regulatory_framework' => 'LSS (Artículo 168, Fracción II)'],
            ['description' => 'Guarderías y prestaciones sociales', 'type' => 'En especie', 'employer_percentage' => '1.000%', 'worker_percentage' => '0.000%', 'total_percentage' => '1.000%', 'calculation_base' => 'SBC', 'regulatory_framework' => 'LSS  (Artículo 111)'],
            ['description' => 'Fondo Para la Vivienda', 'type' => 'Crédito', 'employer_percentage' => '5.000%', 'worker_percentage' => '0.000%', 'total_percentage' => '5.000%', 'calculation_base' => 'SBC', 'regulatory_framework' => 'LINFONAVIT (Articulo 211, Fraccion II)'],
        ]);
    }
}