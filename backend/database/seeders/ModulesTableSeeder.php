<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Module;

class ModulesTableSeeder extends Seeder
{
    public function run(): void
    {
        // Módulos principales
        $catalogos = Module::create([
            'name' => 'Catalogos',
            'icon_svg' => 'Catalogos.svg',
            'status' => true,
            'path' => '/catalogos',
            'is_parent' => true,
        ]);

        $proveedores = Module::create([
            'name' => 'Proveedores',
            'icon_svg' => 'Proveedor.svg',
            'status' => true,
            'path' => '/proveedores',
            'is_parent' => false,
        ]);

        $facturas = Module::create([
            'name' => 'Facturas',
            'icon_svg' => 'Facturas.svg',
            'status' => true,
            'path' => '/facturas',
            'is_parent' => false,
        ]);


       
        // Submódulos de Catalogos
        Module::create([
            'name' => 'Lineas De Negocio',
            'icon_svg' => 'Lineas_De_Negocio.svg',
            'status' => true,
            'path' => '/catalogos/lineas_de_negocio',
            'parent_id' => $catalogos->id,   // 👈 Aquí se relaciona al padre
        ]);
        Module::create([
            'name' => 'Lugares Corporales',
            'icon_svg' => 'Lugares_Corporales.svg',
            'status' => true,
            'path' => '/catalogos/lugar_corporal',
            'parent_id' => $catalogos->id,   // 👈 Aquí se relaciona al padre
        ]);
        Module::create([
            'name' => 'Tipos De Uniformes',
            'icon_svg' => 'Tipos_Uniformes.svg',
            'status' => true,
            'path' => '/catalogos/tipos_uniformes',
            'parent_id' => $catalogos->id,   // 👈 Aquí se relaciona al padre
        ]);

        Module::create([
            'name' => 'Colores',
            'icon_svg' => 'Colores.svg',
            'status' => true,
            'path' => '/catalogos/colores',
            'parent_id' => $catalogos->id,   // 👈 Aquí se relaciona al padre
        ]);

        Module::create([
            'name' => 'Tallas',
            'icon_svg' => 'Tallas.svg',
            'status' => true,
            'path' => '/catalogos/Tallas',
            'parent_id' => $catalogos->id,   // 👈 Aquí se relaciona al padre
        ]);

        Module::create([
            'name' => 'Bancos',
            'icon_svg' => 'Bancos.svg',
            'status' => true,
            'path' => '/catalogos/bancos',
            'parent_id' => $catalogos->id,   // 👈 Aquí se relaciona al padre
        ]);

        Module::create([
            'name' => 'Sucursales',
            'icon_svg' => 'Sucursal.svg',
            'status' => true,
            'path' => '/catalogos/sucursales',
            'parent_id' => $catalogos->id,   // 👈 Aquí se relaciona al padre
        ]);

        $Cotizador = Module::create([
            'name' => 'Cotizador',
            'icon_svg' => 'Cotizador.svg',
            'status' => true,
            'path' => '/cotizador',
            'is_parent' => false,
        ]);
    }
}
