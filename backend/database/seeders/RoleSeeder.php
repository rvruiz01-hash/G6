<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\RoleUser;
use App\Models\User;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Roles base
        $rolesData = [
            ['name' => 'Administrador',         'icono_svg' => 'Admin.svg'],
            ['name' => 'Administrador Almacen', 'icono_svg' => 'AdminAlmacen.svg'],
        ];

        // Crear roles si no existen
        $roles = collect();
        foreach ($rolesData as $roleData) {
            $roles->push(
                Role::firstOrCreate(
                    ['name' => $roleData['name']],
                    ['icono_svg' => $roleData['icono_svg'], 'status' => true]
                )
            );
        }
        $this->command->info("Roles base creados correctamente.");

        // Obtener usuarios
        $users = User::all();
        if ($users->isEmpty()) {
            $this->command->warn("No existen usuarios en la base de datos.");
            return;
        }

        // --- Usuario base (id=1) ---
        $userBase = $users->firstWhere('id', 1);

        if ($userBase) {
            foreach ($roles as $index => $role) {
                RoleUser::updateOrCreate(
                    ['user_id' => $userBase->id, 'role_id' => $role->id],
                    ['is_primary' => $index === 0] // solo el primero será principal
                );
            }
            $this->command->info("Roles asignados al usuario con id=1.");
        }

        // --- Resto de usuarios ---
        $otherUsers = $users->where('id', '!=', 1);

        foreach ($otherUsers as $user) {
            // Asignar 1 rol aleatorio como principal; el modelo se encargará de ajustar si ya existe uno
            $role = $roles->random();

            RoleUser::updateOrCreate(
                ['user_id' => $user->id, 'role_id' => $role->id],
                ['is_primary' => true]
            );
        }

        $this->command->info("Roles asignados aleatoriamente al resto de usuarios.");
    }
}
