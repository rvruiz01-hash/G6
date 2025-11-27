<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\StaffingPlan;

class StaffingPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        StaffingPlan::insert([
            [ 'name' => 'plantilla 1', 'client_site_id' => 1 , 'position_id' => 3, 'quantity' => 10, 'start_date' => now() , 'end_date' => null ],
            [ 'name' => 'plantilla 2', 'client_site_id' => 2 , 'position_id' => 4, 'quantity' => 10, 'start_date' => now() , 'end_date' => null ],
            [ 'name' => 'plantilla 3', 'client_site_id' => 3 , 'position_id' => 5, 'quantity' => 10, 'start_date' => now() , 'end_date' => null ],
            [ 'name' => 'plantilla 4', 'client_site_id' => 4 , 'position_id' => 6, 'quantity' => 10, 'start_date' => now() , 'end_date' => null ],
            [ 'name' => 'plantilla 5', 'client_site_id' => 5 , 'position_id' => 7, 'quantity' => 10, 'start_date' => now() , 'end_date' => null ],
            [ 'name' => 'plantilla 6', 'client_site_id' => 6 , 'position_id' => 8, 'quantity' => 10, 'start_date' => now() , 'end_date' => null ],
        ]);
    }
}
