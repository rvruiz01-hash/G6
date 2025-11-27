<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShiftType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftTypeController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $shiftTypes = ShiftType::with('businessLine:id,description')->orderBy('name', 'asc')->get();
            return response()->json(['data' => $shiftTypes], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener tipos de turno', 'error' => $e->getMessage()], 500);
        }
    }

    public function getByBusinessLine(int $businessLineId): JsonResponse
    {
        try {
            $shiftTypes = ShiftType::where('business_line_id', $businessLineId)
                                   ->with('businessLine:id,description')
                                   ->orderBy('name', 'asc')
                                   ->get();
            return response()->json(['data' => $shiftTypes], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener tipos de turno'], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $shiftType = ShiftType::with('businessLine:id,description')->findOrFail($id);
            return response()->json(['data' => $shiftType], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Tipo de turno no encontrado'], 404);
        }
    }
}