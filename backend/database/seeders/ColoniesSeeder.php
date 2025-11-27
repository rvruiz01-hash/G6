<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Colony;
use App\Models\Municipality;

class ColoniesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * NOTA IMPORTANTE: Este seeder contiene solo EJEMPLOS de colonias.
     * Para obtener la base de datos completa de códigos postales de México:
     * 
     * 1. Descarga el catálogo oficial de SEPOMEX desde:
     *    https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx
     * 
     * 2. O utiliza APIs públicas como:
     *    - https://api-sepomex.hckdrk.mx/
     *    - https://github.com/IcaliaLabs/sepomex (gem de Ruby con base de datos)
     * 
     * 3. Puedes procesar el archivo y generar inserts masivos con este formato.
     */
    public function run(): void
    {
        // Desactivar temporalmente las claves foráneas para mejor rendimiento
        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $colonies = [
            // Ciudad de México (09) - Ejemplos
            // Alcaldía Cuauhtémoc
            ['municipality_id' => $this->getMunicipalityId('09', 'CUAUHTÉMOC'), 'name' => 'CENTRO', 'postal_code' => '06000'],
            ['municipality_id' => $this->getMunicipalityId('09', 'CUAUHTÉMOC'), 'name' => 'ROMA NORTE', 'postal_code' => '06700'],
            ['municipality_id' => $this->getMunicipalityId('09', 'CUAUHTÉMOC'), 'name' => 'ROMA SUR', 'postal_code' => '06760'],
            ['municipality_id' => $this->getMunicipalityId('09', 'CUAUHTÉMOC'), 'name' => 'CONDESA', 'postal_code' => '06140'],
            ['municipality_id' => $this->getMunicipalityId('09', 'CUAUHTÉMOC'), 'name' => 'JUÁREZ', 'postal_code' => '06600'],
            ['municipality_id' => $this->getMunicipalityId('09', 'CUAUHTÉMOC'), 'name' => 'HIPÓDROMO', 'postal_code' => '06100'],
            ['municipality_id' => $this->getMunicipalityId('09', 'CUAUHTÉMOC'), 'name' => 'DOCTORES', 'postal_code' => '06720'],
            ['municipality_id' => $this->getMunicipalityId('09', 'CUAUHTÉMOC'), 'name' => 'TABACALERA', 'postal_code' => '06030'],
            
            // Alcaldía Miguel Hidalgo
            ['municipality_id' => $this->getMunicipalityId('09', 'MIGUEL HIDALGO'), 'name' => 'POLANCO', 'postal_code' => '11550'],
            ['municipality_id' => $this->getMunicipalityId('09', 'MIGUEL HIDALGO'), 'name' => 'LOMAS DE CHAPULTEPEC', 'postal_code' => '11000'],
            ['municipality_id' => $this->getMunicipalityId('09', 'MIGUEL HIDALGO'), 'name' => 'ANZURES', 'postal_code' => '11590'],
            ['municipality_id' => $this->getMunicipalityId('09', 'MIGUEL HIDALGO'), 'name' => 'TACUBAYA', 'postal_code' => '11870'],
            
            // Alcaldía Benito Juárez
            ['municipality_id' => $this->getMunicipalityId('09', 'BENITO JUÁREZ'), 'name' => 'DEL VALLE CENTRO', 'postal_code' => '03100'],
            ['municipality_id' => $this->getMunicipalityId('09', 'BENITO JUÁREZ'), 'name' => 'NARVARTE', 'postal_code' => '03020'],
            ['municipality_id' => $this->getMunicipalityId('09', 'BENITO JUÁREZ'), 'name' => 'NÁPOLES', 'postal_code' => '03810'],
            ['municipality_id' => $this->getMunicipalityId('09', 'BENITO JUÁREZ'), 'name' => 'INSURGENTES SAN BORJA', 'postal_code' => '03100'],
            
            // Guadalajara, Jalisco (14)
            ['municipality_id' => $this->getMunicipalityId('14', 'GUADALAJARA'), 'name' => 'CENTRO', 'postal_code' => '44100'],
            ['municipality_id' => $this->getMunicipalityId('14', 'GUADALAJARA'), 'name' => 'AMERICANA', 'postal_code' => '44160'],
            ['municipality_id' => $this->getMunicipalityId('14', 'GUADALAJARA'), 'name' => 'PROVIDENCIA', 'postal_code' => '44630'],
            ['municipality_id' => $this->getMunicipalityId('14', 'GUADALAJARA'), 'name' => 'CHAPALITA', 'postal_code' => '45040'],
            ['municipality_id' => $this->getMunicipalityId('14', 'GUADALAJARA'), 'name' => 'LAFAYETTE', 'postal_code' => '44140'],
            
            ['municipality_id' => $this->getMunicipalityId('14', 'ZAPOPAN'), 'name' => 'ZAPOPAN CENTRO', 'postal_code' => '45100'],
            ['municipality_id' => $this->getMunicipalityId('14', 'ZAPOPAN'), 'name' => 'CIUDAD GRANJA', 'postal_code' => '45010'],
            ['municipality_id' => $this->getMunicipalityId('14', 'ZAPOPAN'), 'name' => 'LOMAS DEL VALLE', 'postal_code' => '45129'],
            
            // Monterrey, Nuevo León (19)
            ['municipality_id' => $this->getMunicipalityId('19', 'MONTERREY'), 'name' => 'CENTRO', 'postal_code' => '64000'],
            ['municipality_id' => $this->getMunicipalityId('19', 'MONTERREY'), 'name' => 'OBISPADO', 'postal_code' => '64060'],
            ['municipality_id' => $this->getMunicipalityId('19', 'MONTERREY'), 'name' => 'MITRAS CENTRO', 'postal_code' => '64460'],
            ['municipality_id' => $this->getMunicipalityId('19', 'MONTERREY'), 'name' => 'DEL VALLE', 'postal_code' => '66220'],
            
            ['municipality_id' => $this->getMunicipalityId('19', 'SAN PEDRO GARZA GARCÍA'), 'name' => 'DEL VALLE', 'postal_code' => '66220'],
            ['municipality_id' => $this->getMunicipalityId('19', 'SAN PEDRO GARZA GARCÍA'), 'name' => 'CONTRY', 'postal_code' => '66050'],
            ['municipality_id' => $this->getMunicipalityId('19', 'SAN PEDRO GARZA GARCÍA'), 'name' => 'CARRIZALEJO', 'postal_code' => '66254'],
            
            // Puebla, Puebla (21)
            ['municipality_id' => $this->getMunicipalityId('21', 'PUEBLA'), 'name' => 'CENTRO HISTÓRICO', 'postal_code' => '72000'],
            ['municipality_id' => $this->getMunicipalityId('21', 'PUEBLA'), 'name' => 'LA PAZ', 'postal_code' => '72160'],
            ['municipality_id' => $this->getMunicipalityId('21', 'PUEBLA'), 'name' => 'AZCÁRATE', 'postal_code' => '72501'],
            ['municipality_id' => $this->getMunicipalityId('21', 'PUEBLA'), 'name' => 'ANZURES', 'postal_code' => '72530'],
            
            // Querétaro, Querétaro (22)
            ['municipality_id' => $this->getMunicipalityId('22', 'QUERÉTARO'), 'name' => 'CENTRO', 'postal_code' => '76000'],
            ['municipality_id' => $this->getMunicipalityId('22', 'QUERÉTARO'), 'name' => 'JURIQUILLA', 'postal_code' => '76230'],
            ['municipality_id' => $this->getMunicipalityId('22', 'QUERÉTARO'), 'name' => 'EL REFUGIO', 'postal_code' => '76146'],
            
            // Mérida, Yucatán (31)
            ['municipality_id' => $this->getMunicipalityId('31', 'MÉRIDA'), 'name' => 'CENTRO', 'postal_code' => '97000'],
            ['municipality_id' => $this->getMunicipalityId('31', 'MÉRIDA'), 'name' => 'ITZIMNÁ', 'postal_code' => '97100'],
            ['municipality_id' => $this->getMunicipalityId('31', 'MÉRIDA'), 'name' => 'GARCÍA GINERÉS', 'postal_code' => '97070'],
            ['municipality_id' => $this->getMunicipalityId('31', 'MÉRIDA'), 'name' => 'MONTEJO', 'postal_code' => '97127'],
            
            // Tijuana, Baja California (02)
            ['municipality_id' => $this->getMunicipalityId('02', 'TIJUANA'), 'name' => 'ZONA CENTRO', 'postal_code' => '22000'],
            ['municipality_id' => $this->getMunicipalityId('02', 'TIJUANA'), 'name' => 'CACHO', 'postal_code' => '22040'],
            ['municipality_id' => $this->getMunicipalityId('02', 'TIJUANA'), 'name' => 'PLAYAS DE TIJUANA', 'postal_code' => '22200'],
            
            // Cancún, Quintana Roo (23)
            ['municipality_id' => $this->getMunicipalityId('23', 'BENITO JUÁREZ'), 'name' => 'CENTRO', 'postal_code' => '77500'],
            ['municipality_id' => $this->getMunicipalityId('23', 'BENITO JUÁREZ'), 'name' => 'ZONA HOTELERA', 'postal_code' => '77500'],
            ['municipality_id' => $this->getMunicipalityId('23', 'BENITO JUÁREZ'), 'name' => 'SUPERMANZANA 2', 'postal_code' => '77504'],
            
            // Aguascalientes, Aguascalientes (01)
            ['municipality_id' => $this->getMunicipalityId('01', 'AGUASCALIENTES'), 'name' => 'ZONA CENTRO', 'postal_code' => '20000'],
            ['municipality_id' => $this->getMunicipalityId('01', 'AGUASCALIENTES'), 'name' => 'BELLA VISTA', 'postal_code' => '20060'],
            ['municipality_id' => $this->getMunicipalityId('01', 'AGUASCALIENTES'), 'name' => 'DEL VALLE', 'postal_code' => '20080'],
        ];

        // Insertar en lotes para mejor rendimiento
        $chunks = array_chunk($colonies, 500);
        foreach ($chunks as $chunk) {
            Colony::insert($chunk);
        }

        // Reactivar las claves foráneas
        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Obtener el ID del municipio basado en federal_entity_id y nombre
     */
    private function getMunicipalityId(string $federalEntityId, string $municipalityName): int
    {
        static $cache = [];
        
        $key = $federalEntityId . '_' . $municipalityName;
        
        if (!isset($cache[$key])) {
            $municipality = Municipality::where('federal_entity_id', $federalEntityId)
                ->where('name', $municipalityName)
                ->first();
                
            if (!$municipality) {
                throw new \Exception("Municipality not found: {$municipalityName} in federal entity {$federalEntityId}");
            }
            
            $cache[$key] = $municipality->id;
        }
        
        return $cache[$key];
    }
}