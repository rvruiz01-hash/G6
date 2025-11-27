<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Municipality;
use App\Models\FederalEntity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MunicipalityController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/municipalities
     */
    public function index(): JsonResponse
    {
        try {
            $municipalities = Municipality::with('federalEntity')
                ->orderBy('name', 'asc')
                ->get();
            
            return response()->json($municipalities, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los municipios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/municipalities/{id}
     */
    public function show(Municipality $municipality): JsonResponse
    {
        try {
            $municipality->load('federalEntity');
            return response()->json($municipality, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Municipio no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Obtener municipios por entidad federativa
     * GET /api/municipalities/by-state/{stateId}
     */
    public function getByState(string $stateId): JsonResponse
    {
        try {
            // Normalizar ID del estado (2 dígitos)
            $stateId = str_pad($stateId, 2, '0', STR_PAD_LEFT);
            
            $federalEntity = FederalEntity::findOrFail($stateId);
            
            $municipalities = Municipality::where('federal_entity_id', $stateId)
                ->orderBy('name', 'asc')
                ->get(['id', 'name', 'federal_entity_id']);
            
            return response()->json([
                'federal_entity' => $federalEntity,
                'municipalities' => $municipalities,
                'total' => $municipalities->count(),
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener municipios del estado',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}