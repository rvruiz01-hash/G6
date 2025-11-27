<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Uma;
use Illuminate\Http\JsonResponse;

class UmaController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $umas = Uma::orderBy('year', 'desc')->get();
            return response()->json(['data' => $umas], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener UMAs', 'error' => $e->getMessage()], 500);
        }
    }

    public function current(): JsonResponse
    {
        try {
            $uma = Uma::orderBy('year', 'desc')->first();
            return response()->json(['data' => $uma], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener UMA actual'], 500);
        }
    }
}