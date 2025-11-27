<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HolidayDay;
use Illuminate\Http\JsonResponse;

class HolidayDayController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $holidays = HolidayDay::orderBy('date', 'asc')->get();
            return response()->json(['data' => $holidays], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener días festivos', 'error' => $e->getMessage()], 500);
        }
    }

    public function show(string $id): JsonResponse
    {
        try {
            $holiday = HolidayDay::findOrFail($id);
            return response()->json(['data' => $holiday], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Día festivo no encontrado'], 404);
        }
    }
}