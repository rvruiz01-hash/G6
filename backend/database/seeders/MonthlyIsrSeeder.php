<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MonthlyIsrSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('monthly_isr')->insert([
            ['lower_limit' => 0.01, 'upper_limit' => 496.08, 'fixed_fee' => 0.00, 'excess_percentage' => 1.92],
            ['lower_limit' => 496.08, 'upper_limit' => 4210.42, 'fixed_fee' => 9.52, 'excess_percentage' => 6.40],
            ['lower_limit' => 4210.42, 'upper_limit' => 7399.43, 'fixed_fee' => 247.24, 'excess_percentage' => 10.88],
            ['lower_limit' => 7399.43, 'upper_limit' => 8601.51, 'fixed_fee' => 594.21, 'excess_percentage' => 16.00],
            ['lower_limit' => 8601.51, 'upper_limit' => 10298.36, 'fixed_fee' => 786.54, 'excess_percentage' => 17.92],
            ['lower_limit' => 10298.36, 'upper_limit' => 20770.30, 'fixed_fee' => 1090.61, 'excess_percentage' => 21.36],
            ['lower_limit' => 20770.30, 'upper_limit' => 32736.84, 'fixed_fee' => 3327.42, 'excess_percentage' => 23.52],
            ['lower_limit' => 32736.84, 'upper_limit' => 62500.01, 'fixed_fee' => 6141.95, 'excess_percentage' => 30.00],
            ['lower_limit' => 62500.01, 'upper_limit' => 83333.34, 'fixed_fee' => 15070.90, 'excess_percentage' => 32.00],
            ['lower_limit' => 83333.34, 'upper_limit' => 250000.01, 'fixed_fee' => 21737.57, 'excess_percentage' => 34.00],
            ['lower_limit' => 250000.01, 'upper_limit' => 990000.00, 'fixed_fee' => 78404.23, 'excess_percentage' => 35.00],
        ]);
    }
}