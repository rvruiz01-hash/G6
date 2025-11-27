<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salary;
use Illuminate\Http\JsonResponse;

class SalaryController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $salaries = Salary::orderBy('effective_date', 'desc')->get();
            return response()->json(['data' => $salaries], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener salarios', 'error' => $e->getMessage()], 500);
        }
    }

    public function current(): JsonResponse
    {
        try {
            $salary = Salary::orderBy('effective_date', 'desc')->first();
            return response()->json(['data' => $salary], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener salario actual'], 500);
        }
    }
}