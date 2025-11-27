<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Colony;
use App\Models\Municipality;
use App\Models\FederalEntity;
use Illuminate\Support\Facades\DB;

class ImportSepomexCatalog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sepomex:import 
                            {file? : Path to the SEPOMEX file (default: storage/sepomex/CPdescarga.txt)}
                            {--chunk=1000 : Number of records to insert per batch}
                            {--truncate : Truncate colonies table before import}
                            {--test=0 : Test mode - only import N records}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import postal codes from SEPOMEX catalog file (Updated format 2025)';

    /**
     * Cache para municipios
     */
    private $municipalityCache = [];

    /**
     * Estadísticas de importación
     */
    private $stats = [
        'processed' => 0,
        'imported' => 0,
        'skipped' => 0,
        'errors' => 0,
        'duplicates' => 0,
    ];

    /**
     * Set para evitar duplicados
     */
    private $importedKeys = [];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file') ?? storage_path('sepomex/CPdescarga.txt');
        
        if (!file_exists($filePath)) {
            $this->error("❌ File not found: {$filePath}");
            $this->line('');
            $this->info('Please download the SEPOMEX catalog from:');
            $this->line('https://www.correosdemexico.gob.mx/SSLServicios/ConsultaCP/CodigoPostal_Exportar.aspx');
            $this->line('');
            $this->info('And save it to: ' . storage_path('sepomex/CPdescarga.txt'));
            return 1;
        }

        $this->info('🚀 Starting SEPOMEX catalog import...');
        $this->line('File: ' . $filePath);
        $this->line('');

        // Mostrar información del archivo
        $this->showFileInfo($filePath);

        // Confirmar antes de proceder
        if ($this->option('truncate')) {
            if (!$this->confirm('⚠️  This will DELETE all existing colonies. Continue?', false)) {
                $this->warn('Import cancelled.');
                return 0;
            }
        } else {
            if (!$this->confirm('This will import thousands of records. Continue?', true)) {
                $this->warn('Import cancelled.');
                return 0;
            }
        }

        $startTime = microtime(true);
        
        // Truncar tabla si se solicita
        if ($this->option('truncate')) {
            $this->info('🗑️  Truncating colonies table...');
            DB::table('colonies')->truncate();
            $this->info('✓ Table truncated');
            $this->line('');
        }

        // Precarga de municipios para mejor rendimiento
        $this->info('📚 Preloading municipalities...');
        $this->preloadMunicipalities();
        $this->info('✓ ' . count($this->municipalityCache) . ' municipalities loaded');
        $this->line('');

        // Importar el archivo
        $this->importFile($filePath);

        $duration = round(microtime(true) - $startTime, 2);

        // Mostrar estadísticas
        $this->line('');
        $this->info('✅ Import completed!');
        $this->line('');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Records Processed', number_format($this->stats['processed'])],
                ['Records Imported', number_format($this->stats['imported'])],
                ['Duplicates Skipped', number_format($this->stats['duplicates'])],
                ['Municipality Not Found', number_format($this->stats['skipped'])],
                ['Errors', number_format($this->stats['errors'])],
                ['Duration', $duration . ' seconds'],
                ['Speed', number_format($this->stats['processed'] / max($duration, 1)) . ' records/sec'],
            ]
        );

        // Verificar registros en base de datos
        $totalColonies = Colony::count();
        $this->line('');
        $this->info("📊 Total colonies in database: " . number_format($totalColonies));

        return 0;
    }

    /**
     * Mostrar información del archivo
     */
    private function showFileInfo(string $filePath)
    {
        $handle = fopen($filePath, 'r');
        
        // Saltar línea de copyright
        $firstLine = fgets($handle);
        if (str_contains($firstLine, 'Catálogo Nacional')) {
            fgets($handle); // Saltar línea en blanco si existe
        } else {
            rewind($handle); // Regresar al inicio si no hay copyright
        }
        
        // Leer encabezado
        $header = fgets($handle);
        $columns = explode('|', trim($header));
        
        fclose($handle);
        
        $this->line('File columns detected: ' . count($columns));
        $this->line('Header: ' . implode(' | ', array_slice($columns, 0, 8)) . '...');
        $this->line('');
    }

    /**
     * Precargar todos los municipios en memoria
     */
    private function preloadMunicipalities()
    {
        $municipalities = Municipality::with('federalEntity')->get();
        
        foreach ($municipalities as $municipality) {
            // Crear múltiples claves para facilitar búsqueda
            $cleanName = $this->cleanMunicipalityName($municipality->name);
            
            $key1 = $municipality->federal_entity_id . '|' . $municipality->name;
            $key2 = $municipality->federal_entity_id . '|' . $cleanName;
            
            $this->municipalityCache[$key1] = $municipality->id;
            $this->municipalityCache[$key2] = $municipality->id;
        }
    }

    /**
     * Limpiar nombre de municipio para búsqueda flexible
     */
    private function cleanMunicipalityName(string $name): string
    {
        $name = mb_strtoupper(trim($name), 'UTF-8');
        
        // Remover acentos
        $unwanted = [
            'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U',
            'Ñ' => 'N', 'Ü' => 'U',
        ];
        $name = strtr($name, $unwanted);
        
        // Remover palabras comunes que varían
        $name = str_replace(['DE ', 'LA ', 'EL ', 'LOS ', 'LAS '], '', $name);
        
        return $name;
    }

    /**
     * Importar el archivo SEPOMEX
     */
    private function importFile(string $filePath)
    {
        $chunkSize = (int) $this->option('chunk');
        $testMode = (int) $this->option('test');
        
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        $handle = fopen($filePath, 'r');
        
        // Saltar línea de copyright si existe
        $firstLine = fgets($handle);
        if (str_contains($firstLine, 'Catálogo Nacional')) {
            // Ya saltamos el copyright
        } else {
            rewind($handle);
        }
        
        // Saltar encabezado
        $header = fgets($handle);
        
        $colonies = [];
        $progressBar = $this->output->createProgressBar();
        $progressBar->start();
        
        while (($line = fgets($handle)) !== false) {
            // Test mode limit
            if ($testMode > 0 && $this->stats['processed'] >= $testMode) {
                break;
            }
            
            $this->stats['processed']++;
            
            $data = str_getcsv($line, '|');
            
            // Validar que la línea tenga suficientes columnas
            // Formato nuevo: 15 columnas (con dos c_CP)
            if (count($data) < 14) {
                $this->stats['skipped']++;
                continue;
            }
            
            try {
                // FORMATO ACTUAL DEL ARCHIVO SEPOMEX (2025):
                // 0: d_codigo (CP de la colonia)
                // 1: d_asenta (Nombre de la colonia)
                // 2: d_tipo_asenta (Tipo: Colonia, Fraccionamiento, etc)
                // 3: D_mnpio (Nombre del municipio)
                // 4: d_estado (Nombre del estado)
                // 5: d_ciudad (Nombre de la ciudad)
                // 6: d_CP (CP de administración)
                // 7: c_estado (Código del estado - 2 dígitos)
                // 8: c_oficina (Código de oficina)
                // 9: c_CP (Código postal - DUPLICADO, ignorar)
                // 10: c_tipo_asenta (Código tipo asentamiento)
                // 11: c_mnpio (Código del municipio)
                // 12: id_asenta_cpcons (ID único)
                // 13: d_zona (Urbano/Rural)
                // 14: c_cve_ciudad (Código de ciudad)
                
                $postalCode = trim($data[0]);      // d_codigo
                $colonyName = trim($data[1]);      // d_asenta
                $municipalityName = trim($data[3]); // D_mnpio
                $stateCode = str_pad(trim($data[7]), 2, '0', STR_PAD_LEFT); // c_estado
                
                // Validar datos mínimos
                if (empty($postalCode) || empty($colonyName) || empty($municipalityName)) {
                    $this->stats['skipped']++;
                    continue;
                }
                
                // Buscar municipio en caché
                $municipalityId = $this->findMunicipalityId($stateCode, $municipalityName);
                
                if (!$municipalityId) {
                    $this->stats['skipped']++;
                    
                    // Log en modo verbose
                    if ($this->output->isVerbose()) {
                        $this->warn("Municipality not found: {$municipalityName} ({$stateCode})");
                    }
                    continue;
                }
                
                // Crear clave única para evitar duplicados
                $uniqueKey = $municipalityId . '|' . $postalCode . '|' . mb_strtoupper($colonyName);
                
                if (isset($this->importedKeys[$uniqueKey])) {
                    $this->stats['duplicates']++;
                    continue;
                }
                
                $this->importedKeys[$uniqueKey] = true;
                
                // Agregar a batch
                $colonies[] = [
                    'municipality_id' => $municipalityId,
                    'name' => mb_strtoupper($colonyName, 'UTF-8'),
                    'postal_code' => str_pad($postalCode, 5, '0', STR_PAD_LEFT),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                
                // Insertar cuando alcancemos el tamaño del lote
                if (count($colonies) >= $chunkSize) {
                    $this->insertBatch($colonies);
                    $colonies = [];
                }
                
                $progressBar->advance();
                
            } catch (\Exception $e) {
                $this->stats['errors']++;
                
                if ($this->output->isVerbose()) {
                    $this->error('Error processing line: ' . $e->getMessage());
                }
            }
        }
        
        // Insertar colonias restantes
        if (!empty($colonies)) {
            $this->insertBatch($colonies);
        }
        
        $progressBar->finish();
        fclose($handle);
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    /**
     * Buscar ID de municipio en caché
     */
    private function findMunicipalityId(string $stateCode, string $municipalityName): ?int
    {
        $municipalityName = mb_strtoupper(trim($municipalityName), 'UTF-8');
        
        // Búsqueda directa
        $key = $stateCode . '|' . $municipalityName;
        if (isset($this->municipalityCache[$key])) {
            return $this->municipalityCache[$key];
        }
        
        // Búsqueda con nombre limpio
        $cleanName = $this->cleanMunicipalityName($municipalityName);
        $key2 = $stateCode . '|' . $cleanName;
        if (isset($this->municipalityCache[$key2])) {
            return $this->municipalityCache[$key2];
        }
        
        // Búsqueda flexible (contiene)
        foreach ($this->municipalityCache as $cachedKey => $id) {
            list($cachedState, $cachedName) = explode('|', $cachedKey, 2);
            
            if ($cachedState === $stateCode) {
                $cachedClean = $this->cleanMunicipalityName($cachedName);
                
                // Búsqueda parcial
                if (str_contains($cachedClean, $cleanName) || 
                    str_contains($cleanName, $cachedClean)) {
                    return $id;
                }
            }
        }
        
        return null;
    }

    /**
     * Insertar batch de colonias
     */
    private function insertBatch(array $colonies)
    {
        try {
            Colony::insert($colonies);
            $this->stats['imported'] += count($colonies);
        } catch (\Exception $e) {
            $this->stats['errors'] += count($colonies);
            
            if ($this->output->isVerbose()) {
                $this->warn('Error inserting batch: ' . $e->getMessage());
            }
        }
    }
}
