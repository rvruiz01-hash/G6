<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ClientSite;
use Carbon\Carbon;

class ClientSiteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ClientSite::insert([
            [
                'id' => 1,
                'name' => 'Sitio Cliente 1',
                'client_id' => 1,
                'business_line_id' => 1,
                'status' => 'active',
                'federal_entity_id' => '03',
                'start_date' => Carbon::now(),
                'end_date' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 2,
                'name' => 'Sitio Cliente 2',
                'client_id' => 2,
                'business_line_id' => 1,
                'status' => 'active',
                'federal_entity_id' => '02',
                'start_date' => Carbon::now(),
                'end_date' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 3,
                'name' => 'Sitio Cliente 3',
                'client_id' => 3,
                'business_line_id' => 1,
                'status' => 'active',
                'federal_entity_id' => '01',
                'start_date' => Carbon::now(),
                'end_date' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 4,
                'name' => 'Sitio Cliente 4',
                'client_id' => 4,
                'business_line_id' => 1,
                'status' => 'active',
                'federal_entity_id' => '06',
                'start_date' => Carbon::now(),
                'end_date' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 5,
                'name' => 'Sitio Cliente 5',
                'client_id' => 5,
                'business_line_id' => 2,
                'status' => 'active',
                'federal_entity_id' => '03',
                'start_date' => Carbon::now(),
                'end_date' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'id' => 6,
                'name' => 'Sitio Cliente 6',
                'client_id' => 6,
                'business_line_id' => 2,
                'status' => 'active',
                'federal_entity_id' => '02',
                'start_date' => Carbon::now(),
                'end_date' => null,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
}
