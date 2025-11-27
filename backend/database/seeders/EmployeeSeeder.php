<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Support\Str;
use App\Models\Position;
use App\Models\StaffingPlan;
use App\Models\FederalEntity;
use App\Models\EmployeeStatus;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $this->command->warn("No existen usuarios para asignar empleados.");
            return;
        }

                // Obtener ID válidos para FK
        $positions       = Position::pluck('id')->toArray();
        $staffingPlans   = StaffingPlan::pluck('id')->toArray();
        $federalEntities = FederalEntity::pluck('id')->toArray();
        $statuses        = EmployeeStatus::pluck('id')->toArray();

        foreach ($users as $user) {
            // Verificar si ya tiene un empleado (por unique)
            if (Employee::where('user_id', $user->id)->exists()) {
                continue;
            }

            Employee::create([
                'user_id' => $user->id,
                'name' => fake()->firstName(),
                'paternal_last_name' => fake()->lastName(),
                'maternal_last_name' => fake()->lastName(),
                'photo' => null,
                 // FKs
                'position_id'        => fake()->randomElement($positions),
                'staffing_plan_id'   => fake()->randomElement($staffingPlans),
                'employee_status_id' => fake()->randomElement($statuses),

                // datos opcionales
                'email'             => fake()->unique()->safeEmail(),
                'cellphone_number'  => fake()->numerify('55########'),

                // manager_id: puede ser null o un empleado previo
                'manager_id'        => Employee::inRandomOrder()->value('id'),
            ]);
        }

        $this->command->info("Empleados generados para todos los usuarios existentes.");
    }
}
