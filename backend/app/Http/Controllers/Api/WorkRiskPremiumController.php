<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkRiskPremium;
use Illuminate\Http\JsonResponse;

class WorkRiskPremiumController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $premiums = WorkRiskPremium::orderBy('year', 'desc')->orderBy('month', 'desc')->get();
            return response()->json(['data' => $premiums], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener primas de riesgo', 'error' => $e->getMessage()], 500);
        }
    }

    public function current(): JsonResponse
    {
        try {
            $premium = WorkRiskPremium::orderBy('year', 'desc')->orderBy('month', 'desc')->first();
            return response()->json(['data' => $premium], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener prima actual'], 500);
        }
    }
}