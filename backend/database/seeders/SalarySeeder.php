<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SalarySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('salaries')->insert([
            'effective_date' => '2025-01-01',
            'area_a' => 278.80,
            'area_b' => 278.80,
            'area_c' => 419.88,
        ]);
    }
}