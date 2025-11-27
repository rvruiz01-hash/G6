<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Colony;
use App\Models\Municipality;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ColonyController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/colonies
     */
    public function index(): JsonResponse
    {
        try {
            // Limitar a 100 registros por defecto para evitar sobrecarga
            $colonies = Colony::with(['municipality.federalEntity'])
                ->orderBy('name', 'asc')
                ->limit(100)
                ->get();
            
            return response()->json($colonies, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las colonias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/colonies/{id}
     */
    public function show(Colony $colony): JsonResponse
    {
        try {
            $colony->load(['municipality.federalEntity']);
            return response()->json($colony, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Colonia no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Buscar colonias por código postal
     * GET /api/colonies/by-postal-code/{postalCode}
     * 
     * Retorna:
     * - Todas las colonias del código postal
     * - El municipio al que pertenecen
     * - La entidad federativa
     */
    public function getByPostalCode(string $postalCode): JsonResponse
    {
        try {
            // Normalizar código postal (5 dígitos con ceros a la izquierda)
            $postalCode = str_pad($postalCode, 5, '0', STR_PAD_LEFT);
            
            $colonies = Colony::with([
                'municipality.federalEntity'
            ])
            ->where('postal_code', $postalCode)
            ->orderBy('name', 'asc')
            ->get();
            
            if ($colonies->isEmpty()) {
                return response()->json([
                    'message' => 'No se encontraron colonias para este código postal',
                    'postal_code' => $postalCode,
                    'colonies' => [],
                    'municipality' => null,
                    'federal_entity' => null,
                ], 404);
            }
            
            // Todas las colonias de un CP pertenecen al mismo municipio
            $municipality = $colonies->first()->municipality;
            $federalEntity = $municipality->federalEntity;
            
            return response()->json([
                'postal_code' => $postalCode,
                'colonies' => $colonies,
                'municipality' => $municipality,
                'federal_entity' => $federalEntity,
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al buscar colonias por código postal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener colonias por municipio
     * GET /api/colonies/by-municipality/{municipalityId}
     */
    public function getByMunicipality(int $municipalityId): JsonResponse
    {
        try {
            $municipality = Municipality::with('federalEntity')->findOrFail($municipalityId);
            
            $colonies = Colony::where('municipality_id', $municipalityId)
                ->orderBy('name', 'asc')
                ->get(['id', 'name', 'postal_code', 'municipality_id']);
            
            return response()->json([
                'municipality' => $municipality,
                'federal_entity' => $municipality->federalEntity,
                'colonies' => $colonies,
                'total' => $colonies->count(),
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener colonias del municipio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar colonia específica y obtener su código postal
     * GET /api/colonies/{id}/postal-code
     */
    public function getPostalCode(int $id): JsonResponse
    {
        try {
            $colony = Colony::with(['municipality.federalEntity'])
                ->findOrFail($id);
            
            return response()->json([
                'colony' => $colony,
                'postal_code' => $colony->postal_code,
                'municipality' => $colony->municipality,
                'federal_entity' => $colony->municipality->federalEntity,
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Colonia no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}