<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class BranchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $branches = Branch::with('federalEntity:id,name,abbreviation')
                ->orderBy('name', 'asc')
                ->get();
            
            return response()->json($branches, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las sucursales',
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
                'name' => 'required|string|max:150',
                'code' => 'required|string|max:20|unique:branches,code',
                'federal_entity_id' => 'required|exists:federal_entities,id',
                'address' => 'nullable|string|max:250',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:100',
                'status' => 'boolean',
            ], [
                'name.required' => 'El nombre de la sucursal es obligatorio',
                'name.max' => 'El nombre no puede exceder 150 caracteres',
                'code.required' => 'El código de la sucursal es obligatorio',
                'code.unique' => 'Este código ya está registrado',
                'code.max' => 'El código no puede exceder 20 caracteres',
                'federal_entity_id.required' => 'La entidad federativa es obligatoria',
                'federal_entity_id.exists' => 'La entidad federativa seleccionada no existe',
                'address.max' => 'La dirección no puede exceder 250 caracteres',
                'phone.max' => 'El teléfono no puede exceder 20 caracteres',
                'email.email' => 'El email no es válido',
                'email.max' => 'El email no puede exceder 100 caracteres',
            ]);

            $branch = Branch::create($validated);
            
            // Cargar la relación para la respuesta
            $branch->load('federalEntity:id,name,abbreviation');

            return response()->json($branch, 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear la sucursal',
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
            $branch = Branch::findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:150',
                'code' => 'required|string|max:20|unique:branches,code,' . $id,
                'federal_entity_id' => 'required|exists:federal_entities,id',
                'address' => 'nullable|string|max:250',
                'phone' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:100',
                'status' => 'boolean',
            ], [
                'name.required' => 'El nombre de la sucursal es obligatorio',
                'name.max' => 'El nombre no puede exceder 150 caracteres',
                'code.required' => 'El código de la sucursal es obligatorio',
                'code.unique' => 'Este código ya está registrado',
                'code.max' => 'El código no puede exceder 20 caracteres',
                'federal_entity_id.required' => 'La entidad federativa es obligatoria',
                'federal_entity_id.exists' => 'La entidad federativa seleccionada no existe',
                'address.max' => 'La dirección no puede exceder 250 caracteres',
                'phone.max' => 'El teléfono no puede exceder 20 caracteres',
                'email.email' => 'El email no es válido',
                'email.max' => 'El email no puede exceder 100 caracteres',
            ]);

            $branch->update($validated);
            
            // Cargar la relación para la respuesta
            $branch->load('federalEntity:id,name,abbreviation');

            return response()->json($branch, 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la sucursal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}