<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EntityPercentageSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('entity_percentages')->insert([
            'percentage' => 3.00,
            'federal_entity_id' => '09',
            'business_line_id' => 1,
        ]);
    }
}