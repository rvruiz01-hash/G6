<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EntityPercentage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntityPercentageController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $percentages = EntityPercentage::with(['federalEntity', 'businessLine'])->get();
            return response()->json(['data' => $percentages], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener porcentajes', 'error' => $e->getMessage()], 500);
        }
    }

    public function getByEntityAndLine(Request $request): JsonResponse
    {
        try {
            $percentage = EntityPercentage::where('federal_entity_id', $request->federal_entity_id)
                                         ->where('business_line_id', $request->business_line_id)
                                         ->with(['federalEntity', 'businessLine'])
                                         ->first();
            return response()->json(['data' => $percentage], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Porcentaje no encontrado'], 404);
        }
    }
}