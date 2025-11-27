<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Color;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ColorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $colors = Color::orderBy('description', 'asc')->get();
            return response()->json($colors, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los colores',
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
                'description' => 'required|string|max:255|unique:colors,description',
            ], [
                'description.required' => 'La descripción es obligatoria',
                'description.unique' => 'Este color ya existe',
                'description.max' => 'La descripción no puede exceder 255 caracteres',
            ]);

            $color = Color::create($validated);

            return response()->json($color, 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el color',
                'error' => $e->getMessage()
            ], 500);
        }
    }
  
}