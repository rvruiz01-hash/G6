<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UmaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('umas')->insert([
            'year' => 2025,
            'daily' => 108.57,
            'monthly' => 3300.53,
            'annual' => 39606.36,
        ]);
    }
}