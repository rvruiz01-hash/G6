<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImssConcept;
use Illuminate\Http\JsonResponse;

class ImssConceptController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $concepts = ImssConcept::orderBy('id', 'asc')->get();
            return response()->json(['data' => $concepts], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener conceptos IMSS', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $concept = ImssConcept::findOrFail($id);
            return response()->json(['data' => $concept], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Concepto IMSS no encontrado'], 404);
        }
    }
}