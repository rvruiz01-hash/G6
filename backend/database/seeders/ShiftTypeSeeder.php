<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShiftTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('shift_types')->insert([
            'name' => '12X12X7',
            'business_line_id' => 1,
            'total_rest_days' => 4,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}