<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Region;

class RegionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         $regions = [
            [ 'name' => 'Norte' ],
            [ 'name'  => 'Centro' ],
            [ 'name' => 'Sur' ],
        ];
        foreach ($regions as $region) {
            Region::firstOrCreate($region);
        }
    }
}
