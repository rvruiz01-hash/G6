<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Day31Charge;
use Illuminate\Http\JsonResponse;

class Day31ChargeController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $charges = Day31Charge::orderBy('effective_date', 'desc')->get();
            return response()->json(['data' => $charges], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener cobros día 31', 'error' => $e->getMessage()], 500);
        }
    }

    public function current(): JsonResponse
    {
        try {
            $charge = Day31Charge::orderBy('effective_date', 'desc')->first();
            return response()->json(['data' => $charge], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener cobro actual'], 500);
        }
    }
}