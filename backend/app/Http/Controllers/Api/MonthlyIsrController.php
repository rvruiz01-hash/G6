<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MonthlyIsr;
use Illuminate\Http\JsonResponse;

class MonthlyIsrController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $isr = MonthlyIsr::orderBy('lower_limit', 'asc')->get();
            return response()->json(['data' => $isr], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener tabla ISR', 'error' => $e->getMessage()], 500);
        }
    }

    public function calculateByAmount(float $amount): JsonResponse
    {
        try {
            $bracket = MonthlyIsr::where('lower_limit', '<=', $amount)
                                 ->where('upper_limit', '>=', $amount)
                                 ->first();
            return response()->json(['data' => $bracket], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al calcular ISR'], 500);
        }
    }
}