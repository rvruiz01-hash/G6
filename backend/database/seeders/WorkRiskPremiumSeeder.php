<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WorkRiskPremiumSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('work_risk_premiums')->insert([
            'registration_id' => 'por ver',
            'year' => 2025,
            'month' => '03',
            'amount' => 2.5984,
        ]);
    }
}