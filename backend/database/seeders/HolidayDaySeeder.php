<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HolidayDaySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('holiday_days')->insert([
            ['description' => 'AÑO NUEVO', 'date' => '2025-01-01'],
            ['description' => 'PROMULGACIÓN DE LA CONSTITUCIÓN POLÍTICA DE 1917', 'date' => '2025-02-03'],
            ['description' => 'NATALICIO BENITO JUÁREZ', 'date' => '2025-03-17'],
            ['description' => 'DIA INTERNACIONAL DEL TRABAJADOR', 'date' => '2025-05-01'],
            ['description' => 'DIA DE LA INDEPENDENCIA', 'date' => '2025-09-16'],
            ['description' => 'DIA DE LA REVOLUCION MEXICANA', 'date' => '2025-11-17'],
            ['description' => 'NAVIDAD', 'date' => '2025-12-25'],
        ]);
    }
}