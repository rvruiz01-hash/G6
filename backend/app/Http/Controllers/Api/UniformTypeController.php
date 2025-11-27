<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UniformType;
use App\Models\Sex; // 👈 NECESARIO para obtener los IDs de MASCULINO/FEMENINO
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB; // 👈 NECESARIO para las transacciones

class UniformTypeController extends Controller
{
    /**
     * Display a listing of the resource. (GET /api/uniform-types)
     * Obtiene todos los registros de tipos de uniformes con sus relaciones.
     */
    public function index(): JsonResponse
    {
        try {
            $uniformTypes = UniformType::with([
                'bodyPart:id,description',
                'businessLine:id,description',
                'sexe:id,name',
                'color:id,description'
            ])
            ->orderBy('description', 'asc')
            ->get();
            
            return response()->json($uniformTypes, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los tipos de uniformes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage. (POST /api/uniform-types)
     * Crea un nuevo registro de tipo de uniforme.
     * ✅ MODIFICADO: Maneja la opción "AMBOS"
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'description' => 'required|string|max:50',
                'business_line_id' => 'required|exists:business_lines,id',
                'sexe_id' => 'required|exists:sexes,id',
                'body_part_id' => 'required|exists:body_parts,id',
                'color_id' => 'required|exists:colors,id',
                'status' => 'boolean',
            ], [
                'description.required' => 'La descripción es obligatoria',
                'description.max' => 'La descripción no puede exceder 50 caracteres',
                'business_line_id.required' => 'La línea de negocio es obligatoria',
                'business_line_id.exists' => 'La línea de negocio seleccionada no existe',
                'sexe_id.required' => 'El sexo es obligatorio',
                'sexe_id.exists' => 'El sexo seleccionado no existe',
                'body_part_id.required' => 'La parte corporal es obligatoria',
                'body_part_id.exists' => 'La parte corporal seleccionada no existe',
                'color_id.required' => 'El color es obligatorio',
                'color_id.exists' => 'El color seleccionado no existe',
            ]);

            // ✅ Verificar si el sexe_id corresponde a "AMBOS"
            $sex = Sex::findOrFail($validated['sexe_id']);
            
            if (strtoupper($sex->name) === 'AMBOS') {
                // 🔄 Crear DOS registros: uno para FEMENINO y otro para MASCULINO
                return $this->createBothSexes($validated);
            }

            // Verificar si ya existe la combinación (para sexo único)
            $exists = UniformType::where('description', $validated['description'])
                         ->where('body_part_id', $validated['body_part_id'])
                         ->where('business_line_id', $validated['business_line_id'])
                         ->where('sexe_id', $validated['sexe_id'])
                         ->where('color_id', $validated['color_id'])
                         ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => [
                        'description' => ['Esta combinación de tipo de uniforme ya existe']
                    ]
                ], 422);
            }

            $uniformType = UniformType::create($validated);
            
            // Cargar las relaciones para la respuesta
            $uniformType->load([
                'bodyPart:id,description',
                'businessLine:id,description',
                'sexe:id,name',
                'color:id,description'
            ]);

            return response()->json($uniformType, 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el tipo de uniforme',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // ---
    
    /**
     * ✅ MÉTODO NUEVO: Crea registros de tipo de uniforme para FEMENINO y MASCULINO.
     */
    private function createBothSexes(array $validated): JsonResponse
    {
        try {
            // Obtener IDs de FEMENINO y MASCULINO
            $femeninoId = Sex::where('name', 'FEMENINO')->value('id');
            $masculinoId = Sex::where('name', 'MASCULINO')->value('id');

            if (!$femeninoId || !$masculinoId) {
                return response()->json([
                    'message' => 'Error: No se encontraron los sexos FEMENINO o MASCULINO en la base de datos',
                ], 500);
            }

            // Verificar si ya existen registros con esta combinación para FEMENINO
            $existsFemenino = UniformType::where('description', $validated['description'])
                                    ->where('body_part_id', $validated['body_part_id'])
                                    ->where('business_line_id', $validated['business_line_id'])
                                    ->where('sexe_id', $femeninoId)
                                    ->where('color_id', $validated['color_id'])
                                    ->exists();

            // Verificar si ya existen registros con esta combinación para MASCULINO
            $existsMasculino = UniformType::where('description', $validated['description'])
                                     ->where('body_part_id', $validated['body_part_id'])
                                     ->where('business_line_id', $validated['business_line_id'])
                                     ->where('sexe_id', $masculinoId)
                                     ->where('color_id', $validated['color_id'])
                                     ->exists();

            if ($existsFemenino || $existsMasculino) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => [
                        'description' => ['Ya existe un tipo de uniforme con esta combinación para uno o ambos sexos']
                    ]
                ], 422);
            }

            // 🔄 Usar transacción para garantizar atomicidad
            DB::beginTransaction();
            
            // Base de datos para los nuevos registros
            $baseData = [
                'description' => $validated['description'],
                'business_line_id' => $validated['business_line_id'],
                'body_part_id' => $validated['body_part_id'],
                'color_id' => $validated['color_id'],
                'status' => $validated['status'] ?? true,
            ];

            // Crear registro para FEMENINO
            $uniformTypeFemenino = UniformType::create(array_merge($baseData, ['sexe_id' => $femeninoId]));

            // Crear registro para MASCULINO
            $uniformTypeMasculino = UniformType::create(array_merge($baseData, ['sexe_id' => $masculinoId]));

            DB::commit();

            // Cargar relaciones para la respuesta
            $uniformTypeFemenino->load(['sexe:id,name', 'bodyPart:id,description', 'businessLine:id,description', 'color:id,description']);
            $uniformTypeMasculino->load(['sexe:id,name', 'bodyPart:id,description', 'businessLine:id,description', 'color:id,description']);

            return response()->json([
                'message' => 'Tipos de uniformes creados exitosamente para ambos sexos',
                'data' => [
                    'femenino' => $uniformTypeFemenino,
                    'masculino' => $uniformTypeMasculino,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear los tipos de uniformes para ambos sexos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // ---

    /**
     * Display the specified resource. (GET /api/uniform-types/{id})
     * Muestra un registro específico de tipo de uniforme.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $uniformType = UniformType::with([
                'bodyPart:id,description',
                'businessLine:id,description',
                'sexe:id,name',
                'color:id,description'
            ])->findOrFail($id);
            
            return response()->json($uniformType, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Tipo de uniforme no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage. (PUT/PATCH /api/uniform-types/{id})
     * Actualiza un registro existente de tipo de uniforme.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $uniformType = UniformType::findOrFail($id);

            $validated = $request->validate([
                'description' => 'required|string|max:50',
                'business_line_id' => 'required|exists:business_lines,id',
                'sexe_id' => 'required|exists:sexes,id',
                'body_part_id' => 'required|exists:body_parts,id',
                'color_id' => 'required|exists:colors,id',
                'status' => 'boolean',
            ], [
                'description.required' => 'La descripción es obligatoria',
                'description.max' => 'La descripción no puede exceder 50 caracteres',
                'business_line_id.required' => 'La línea de negocio es obligatoria',
                'business_line_id.exists' => 'La línea de negocio seleccionada no existe',
                'sexe_id.required' => 'El sexo es obligatorio',
                'body_part_id.required' => 'La parte corporal es obligatoria',
                'body_part_id.exists' => 'La parte corporal seleccionada no existe',
                'sexe_id.exists' => 'El sexo seleccionado no existe',
                'color_id.required' => 'El color es obligatorio',
                'color_id.exists' => 'El color seleccionado no existe',
            ]);

            // Verificar si ya existe la combinación (excluyendo el registro actual)
            $exists = UniformType::where('description', $validated['description'])
                         ->where('body_part_id', $validated['body_part_id'])
                         ->where('business_line_id', $validated['business_line_id'])
                         ->where('sexe_id', $validated['sexe_id'])
                         ->where('color_id', $validated['color_id'])
                         ->where('id', '!=', $id)
                         ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => [
                        'description' => ['Esta combinación de tipo de uniforme ya existe']
                    ]
                ], 422);
            }

            $uniformType->update($validated);
            
            // Cargar las relaciones para la respuesta
            $uniformType->load([
                'bodyPart:id,description',
                'businessLine:id,description',
                'sexe:id,name',
                'color:id,description'
            ]);

            return response()->json($uniformType, 200);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el tipo de uniforme',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage. (DELETE /api/uniform-types/{id})
     * Elimina un registro de tipo de uniforme.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $uniformType = UniformType::findOrFail($id);
            $uniformType->delete();

            return response()->json([
                'message' => 'Tipo de uniforme eliminado exitosamente'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el tipo de uniforme',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}