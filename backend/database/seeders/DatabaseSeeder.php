<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Usuario fijo
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'Admin@example.com',
            'password' => bcrypt('1234')
        ]);

        User::factory()->create([
            'name' => 'AdminAlmacen',
            'email' => 'AdminAlmacen@example.com',
            'password' => bcrypt('1234')
        ]);
        // Generar 9 usuarios aleatorios
        User::factory(8)->create();

        // Ejecutar seeders en orden correcto
        $this->call([
            BusinessLineSeeder::class,
            PositionSeeder::class,
            RoleSeeder::class,
            RoleUserSeeder::class,
            EmployeeStatusSeeder::class,
            EmployeeSeeder::class,
            ModulesTableSeeder::class,
            ModuleRoleSeeder::class,
            RegionSeeder::class,
            FederalEntitySeeder::class,
            MunicipalitiesSeeder::class,
            SexSeeder::class,
            UniformStatusSeeder::class,
            HolidayDaySeeder::class,
            Day31ChargeSeeder::class,
            SenioritySeeder::class,
            UmaSeeder::class,
            SalarySeeder::class,
            ImssConceptSeeder::class,
            WorkRiskPremiumSeeder::class,
            MonthlyIsrSeeder::class,
            EntityPercentageSeeder::class,
            ShiftTypeSeeder::class,
            ClientSeeder::class,
            ClientSiteSeeder::class,
            StaffingPlanSeeder::class,
        ]);
    }
}
