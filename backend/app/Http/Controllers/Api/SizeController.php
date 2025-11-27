<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Size;
use App\Models\Sex;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class SizeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $sizes = Size::with(['sexe:id,name', 'bodyPart:id,description'])
                        ->orderBy('sizes.description', 'asc')
                        ->get();
            
            return response()->json($sizes, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las tallas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * ✅ MODIFICADO: Maneja la opción "AMBOS"
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'description' => 'required|string|max:100',
                'sexe_id' => 'required|exists:sexes,id',
                'body_part_id' => 'required|exists:body_parts,id',
                'status' => 'boolean',
            ], [
                'description.required' => 'La descripción es obligatoria',
                'description.max' => 'La descripción no puede exceder 100 caracteres',
                'sexe_id.required' => 'El sexo es obligatorio',
                'sexe_id.exists' => 'El sexo seleccionado no existe',
                'body_part_id.required' => 'La parte corporal es obligatoria',
                'body_part_id.exists' => 'La parte corporal seleccionada no existe',
            ]);

            // ✅ Verificar si el sexe_id corresponde a "AMBOS"
            $sex = Sex::findOrFail($validated['sexe_id']);
            
            if (strtoupper($sex->name) === 'AMBOS') {
                // 🔄 Crear DOS registros: uno para FEMENINO y otro para MASCULINO
                return $this->createBothSexes($validated);
            }

            // Verificar duplicados para sexo único
            $exists = Size::where('description', $validated['description'])
                         ->where('sexe_id', $validated['sexe_id'])
                         ->where('body_part_id', $validated['body_part_id'])
                         ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => [
                        'description' => ['Esta combinación de talla, sexo y parte corporal ya existe']
                    ]
                ], 422);
            }

            $size = Size::create($validated);
            $size->load(['sexe:id,name', 'bodyPart:id,description']);

            return response()->json($size, 201);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear la talla',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ MÉTODO NUEVO: Crea registros para FEMENINO y MASCULINO
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

            // Verificar si ya existen registros con esta combinación
            $existsFemenino = Size::where('description', $validated['description'])
                                  ->where('sexe_id', $femeninoId)
                                  ->where('body_part_id', $validated['body_part_id'])
                                  ->exists();

            $existsMasculino = Size::where('description', $validated['description'])
                                   ->where('sexe_id', $masculinoId)
                                   ->where('body_part_id', $validated['body_part_id'])
                                   ->exists();

            if ($existsFemenino || $existsMasculino) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => [
                        'description' => ['Ya existe una talla con esta descripción y parte corporal para uno o ambos sexos']
                    ]
                ], 422);
            }

            // 🔄 Usar transacción para garantizar atomicidad
            DB::beginTransaction();

            // Crear registro para FEMENINO
            $sizeFemenino = Size::create([
                'description' => $validated['description'],
                'sexe_id' => $femeninoId,
                'body_part_id' => $validated['body_part_id'],
                'status' => $validated['status'] ?? true,
            ]);

            // Crear registro para MASCULINO
            $sizeMasculino = Size::create([
                'description' => $validated['description'],
                'sexe_id' => $masculinoId,
                'body_part_id' => $validated['body_part_id'],
                'status' => $validated['status'] ?? true,
            ]);

            DB::commit();

            // Cargar relaciones
            $sizeFemenino->load(['sexe:id,name', 'bodyPart:id,description']);
            $sizeMasculino->load(['sexe:id,name', 'bodyPart:id,description']);

            return response()->json([
                'message' => 'Tallas creadas exitosamente para ambos sexos',
                'data' => [
                    'femenino' => $sizeFemenino,
                    'masculino' => $sizeMasculino,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear las tallas para ambos sexos',
                'error' => $e->getMessage()
            ], 500);
        }
    }


}