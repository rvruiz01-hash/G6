<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Day31ChargeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('day_31_charges')->insert([
            'percentage' => 0.17,
            'effective_date' => '2025-06-10',
        ]);
    }
}