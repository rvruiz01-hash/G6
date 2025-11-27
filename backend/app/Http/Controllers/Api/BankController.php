<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class BankController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $banks = Bank::orderBy('name', 'asc')->get();
            return response()->json($banks, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los bancos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100|unique:banks,name',
                'code' => 'required|string|size:3|unique:banks,code',
                'status' => 'boolean',
            ], [
                'name.required' => 'El nombre del banco es obligatorio',
                'name.unique' => 'Este banco ya existe',
                'name.max' => 'El nombre no puede exceder 100 caracteres',
                'code.required' => 'El código del banco es obligatorio',
                'code.size' => 'El código debe tener exactamente 3 dígitos',
                'code.unique' => 'Este código de banco ya existe',
            ]);

            $bank = Bank::create($validated);

            return response()->json($bank, 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el banco',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $bank = Bank::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:100|unique:banks,name,' . $id,
                'code' => 'required|string|size:3|unique:banks,code,' . $id,
                'status' => 'boolean',
            ], [
                'name.required' => 'El nombre del banco es obligatorio',
                'name.unique' => 'Este banco ya existe',
                'name.max' => 'El nombre no puede exceder 100 caracteres',
                'code.required' => 'El código del banco es obligatorio',
                'code.size' => 'El código debe tener exactamente 3 dígitos',
                'code.unique' => 'Este código de banco ya existe',
            ]);

            $bank->update($validated);

            return response()->json($bank, 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el banco',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}