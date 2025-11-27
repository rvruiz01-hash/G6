<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RoleUser;
use App\Models\User;
use App\Models\Role;

class RoleUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $roles = Role::all();

        if ($roles->isEmpty()) {
            $this->command->warn("No hay roles creados. Ejecuta primero RoleSeeder.");
            return;
        }

        foreach ($users as $user) {
            // Escoger un rol principal
            $role = $roles->random();

            RoleUser::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'role_id' => $role->id,
                ],
                [
                    'is_primary' => true,
                ]
            );

            // Opcional: asignar otro rol no principal
            if ($roles->count() > 1) {
                $extraRole = $roles->where('id', '!=', $role->id)->random();

                RoleUser::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'role_id' => $extraRole->id,
                    ],
                    [
                        'is_primary' => false,
                    ]
                );
            }
        }
    }
}
