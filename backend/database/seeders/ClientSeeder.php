<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
     DB::table('clients')->insert([
            [
                'legal_name'       => 'CLIENTE EMPRESARIAL SA DE CV',
                'trade_name'       => 'Cliente Empresarial',
                'email'            => 'contacto@cliente.com',
                'cellphone_number' => '5512345678',
                'rfc'              => 'CEC850101ABC',
                'contact_person'   => 'Juan Pérez',
                'federal_entity_id'=> '09', // CDMX
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'legal_name'       => 'SEGURIDAD INDUSTRIAL MX SA DE CV',
                'trade_name'       => 'Seguridad MX',
                'email'            => 'info@seguridad.mx',
                'cellphone_number' => '5523456789',
                'rfc'              => 'SIM900202XYZ',
                'contact_person'   => 'María López',
                'federal_entity_id'=> '15', // Estado de México
                'created_at'       => now(),
                'updated_at'       => now(),
            ],[
                'legal_name'       => 'TECNOLOGIAS AVANZADAS SA DE CV',
                'trade_name'       => 'Tech Avanzadas',
                'email'            => 'contacto@techavanzadas.com',
                'cellphone_number' => '5534567890',
                'rfc'              => 'TAS900303DEF',
                'contact_person'   => 'Carlos Martínez',
                'federal_entity_id'=> '19', // Puebla
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'legal_name'       => 'LOGISTICA GLOBAL SA DE CV',
                'trade_name'       => 'Logística Global',
                'email'            => 'contacto@logisticaglobal.com',
                'cellphone_number' => '5545678901',
                'rfc'              => 'LGS900404GHI',
                'contact_person'   => 'Ana Gómez',
                'federal_entity_id'=> '07', // Estado de México
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'legal_name'       => 'CONSTRUCCIONES Y SERVICIOS SA DE CV',
                'trade_name'       => 'Construcciones y Servicios',
                'email'            => 'contacto@construccionesyservicios.com',
                'cellphone_number' => '5556789012',
                'rfc'              => 'CSS900505JKL',
                'contact_person'   => 'Luis Fernández',
                'federal_entity_id'=> '08', // Morelos
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                'legal_name'       => 'INDUSTRIAS QUIMICAS SA DE CV',
                'trade_name'       => 'Industrias Químicas',
                'email'            => 'contacto@industriasquimicas.com',
                'cellphone_number' => '5567890123',
                'rfc'              => 'IQS900606MNO',
                'contact_person'   => 'Miguel Torres',
                'federal_entity_id'=> '20', // Morelos
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
        ]);
    }
}
