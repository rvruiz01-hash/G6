<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BodyPart;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;



// Este controlador fue generado como un recurso de API, por lo que incluye los 5 métodos CRUD.
class BodyPartController extends Controller
{
    public function index()
    {
        // Retorna todos los BodyParts, ordenados por descripción alfabéticamente.
        $bodyParts = BodyPart::orderBy('description','asc')->get(['id', 'description']);

        // Laravel convierte automáticamente la colección a JSON.
        return response()->json($bodyParts);
    }
    public function store(Request $request)
    {
        try {
            // Reglas de validación: 'description' es obligatorio, debe ser un string y ser único en la tabla 'body_parts'.
            $validated = $request->validate([
                'description' => 'required|string|max:50|unique:body_parts,description',
            ], [
                'description.required' => 'La descripción es obligatoria',
                'description.unique' => 'Esta parte del cuerpo ya existe',
                'description.max' => 'La descripción no puede exceder 30 caracteres',
            ]);

            $bodyPart = BodyPart::create($validated);

            // Código de respuesta 201 (Created)
            return response()->json($bodyPart, 201);
        } catch (ValidationException $e) {
            // Retorna errores de validación con código 422
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function update(Request $request, $id)
    {
        $bodyParte = BodyPart::find($id);

        if (!$bodyParte) {
            return response()->json(['message' => 'Business Line not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'description' => 'required|string|max:100|unique:body_parts,description,' . $id,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $bodyParte->update($validator->validated());

        return response()->json($bodyParte, 200);
    }

}
