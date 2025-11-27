<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UniformStatus;
use Illuminate\Http\JsonResponse;

class UniformStatusController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/uniform-statuses
     */
    public function index(): JsonResponse
    {
        try {
            $statuses = UniformStatus::orderBy('id', 'asc')->get();
            return response()->json($statuses, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los estatus',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/uniform-statuses/{id}
     */
    public function show(string $id): JsonResponse
    {
        try {
            $status = UniformStatus::findOrFail($id);
            return response()->json($status, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Estatus no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }
}