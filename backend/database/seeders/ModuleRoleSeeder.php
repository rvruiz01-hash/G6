<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ModuleRoleSeeder extends Seeder
{
    public function run(): void
    {
        // Role Admin (id=1) tiene todos los módulos principales y submódulos
        $assignments = [
            // Modulo Admin (id=1)
            ['role_id' => 1, 'module_id' => 1], // Catalogos que al ser padre no tiene modulo por si solo
            // sub modulos de catalogo
            ['role_id' => 1, 'module_id' => 4], // Lineas De Negocio
            ['role_id' => 1, 'module_id' => 9], // Bancos
            ['role_id' => 1, 'module_id' => 10], // Sucursales


            // Rol Admin Almacen (id=2) tiene módulos específicos
            ['role_id' => 2, 'module_id' => 1], // Catalogos que al ser padre no tiene modulo por si solo
            ['role_id' => 2, 'module_id' => 2], // Proveedores
            ['role_id' => 2, 'module_id' => 3], // Facturas
            ['role_id' => 2, 'module_id' => 11], // Facturas
            // sub modulos de catalogo
            ['role_id' => 2, 'module_id' => 5], // Lugares Corporales
            ['role_id' => 2, 'module_id' => 6], // Tipo de uniformes
            ['role_id' => 2, 'module_id' => 7], // Colores
            ['role_id' => 2, 'module_id' => 8], // Tallas

        ];

        foreach ($assignments as $assign) {
            DB::table('module_role')->insert([
                'role_id'    => $assign['role_id'],
                'module_id'  => $assign['module_id'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
