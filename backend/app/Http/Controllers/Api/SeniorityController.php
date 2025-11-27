<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seniority;
use Illuminate\Http\JsonResponse;

class SeniorityController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $seniorities = Seniority::orderBy('years', 'asc')->get();
            return response()->json(['data' => $seniorities], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener antigüedades', 'error' => $e->getMessage()], 500);
        }
    }

    public function getByYears(int $years): JsonResponse
    {
        try {
            $seniority = Seniority::where('years', $years)->first();
            return response()->json(['data' => $seniority], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Antigüedad no encontrada'], 404);
        }
    }
}