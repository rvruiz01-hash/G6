<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FederalEntity;

class FederalEntitySeeder extends Seeder
{
    public function run(): void
    {
        FederalEntity::insert([
            ['id' => '01', 'name' => 'Aguascalientes', 'abbreviation' => 'AGS', 'region_id' => 1],
            ['id' => '02', 'name' => 'Baja California', 'abbreviation' => 'BC', 'region_id' => 1],
            ['id' => '03', 'name' => 'Baja California Sur', 'abbreviation' => 'BCS', 'region_id' => 1],
            ['id' => '04', 'name' => 'Campeche', 'abbreviation' => 'CAMP', 'region_id' => 3],
            ['id' => '05', 'name' => 'Coahuila de Zaragoza', 'abbreviation' => 'COAH', 'region_id' => 1],
            ['id' => '06', 'name' => 'Colima', 'abbreviation' => 'COL', 'region_id' => 2],
            ['id' => '07', 'name' => 'Chiapas', 'abbreviation' => 'CHIS', 'region_id' => 3],
            ['id' => '08', 'name' => 'Chihuahua', 'abbreviation' => 'CHIH', 'region_id' => 1],
            ['id' => '09', 'name' => 'Ciudad de México', 'abbreviation' => 'CDMX', 'region_id' => 2],
            ['id' => '10', 'name' => 'Durango', 'abbreviation' => 'DGO', 'region_id' => 1],
            ['id' => '11', 'name' => 'Guanajuato', 'abbreviation' => 'GTO', 'region_id' => 2],
            ['id' => '12', 'name' => 'Guerrero', 'abbreviation' => 'GRO', 'region_id' => 3],
            ['id' => '13', 'name' => 'Hidalgo', 'abbreviation' => 'HGO', 'region_id' => 2],
            ['id' => '14', 'name' => 'Jalisco', 'abbreviation' => 'JAL', 'region_id' => 2],
            ['id' => '15', 'name' => 'México', 'abbreviation' => 'MEX', 'region_id' => 2],
            ['id' => '16', 'name' => 'Michoacán de Ocampo', 'abbreviation' => 'MICH', 'region_id' => 2],
            ['id' => '17', 'name' => 'Morelos', 'abbreviation' => 'MOR', 'region_id' => 2],
            ['id' => '18', 'name' => 'Nayarit', 'abbreviation' => 'NAY', 'region_id' => 2],
            ['id' => '19', 'name' => 'Nuevo León', 'abbreviation' => 'NL', 'region_id' => 1],
            ['id' => '20', 'name' => 'Oaxaca', 'abbreviation' => 'OAX', 'region_id' => 3],
            ['id' => '21', 'name' => 'Puebla', 'abbreviation' => 'PUE', 'region_id' => 2],
            ['id' => '22', 'name' => 'Querétaro', 'abbreviation' => 'QRO', 'region_id' => 2],
            ['id' => '23', 'name' => 'Quintana Roo', 'abbreviation' => 'QROO', 'region_id' => 3],
            ['id' => '24', 'name' => 'San Luis Potosí', 'abbreviation' => 'SLP', 'region_id' => 1],
            ['id' => '25', 'name' => 'Sinaloa', 'abbreviation' => 'SIN', 'region_id' => 1],
            ['id' => '26', 'name' => 'Sonora', 'abbreviation' => 'SON', 'region_id' => 1],
            ['id' => '27', 'name' => 'Tabasco', 'abbreviation' => 'TAB', 'region_id' => 3],
            ['id' => '28', 'name' => 'Tamaulipas', 'abbreviation' => 'TAMPS', 'region_id' => 1],
            ['id' => '29', 'name' => 'Tlaxcala', 'abbreviation' => 'TLAX', 'region_id' => 2],
            ['id' => '30', 'name' => 'Veracruz de Ignacio de la Llave', 'abbreviation' => 'VER', 'region_id' => 3],
            ['id' => '31', 'name' => 'Yucatán', 'abbreviation' => 'YUC', 'region_id' => 3],
            ['id' => '32', 'name' => 'Zacatecas', 'abbreviation' => 'ZAC', 'region_id' => 1],
        ]);
    }
}
