<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    // Listar todos los módulos
    public function index()
    {
        return response()->json(Module::with('roles')->get());
    }

    // Crear un nuevo módulo
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:modules,name',
            'icon_svg' => 'nullable|string|max:255',
            'status' => 'required|boolean',
        ]);

        $module = Module::create($validated);

        return response()->json([
            'message' => 'Módulo creado correctamente',
            'data' => $module,
        ], 201);
    }

    // Mostrar un módulo por ID
    public function show($id)
    {
        $module = Module::with('roles')->findOrFail($id);
        return response()->json($module);
    }

    // Actualizar un módulo
    public function update(Request $request, $id)
    {
        $module = Module::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:modules,name,' . $module->id,
            'icon_svg' => 'nullable|string|max:255',
            'status' => 'required|boolean',
        ]);

        $module->update($validated);

        return response()->json([
            'message' => 'Módulo actualizado correctamente',
            'data' => $module,
        ]);
    }

    // Eliminar un módulo
    public function destroy($id)
    {
        $module = Module::findOrFail($id);
        $module->delete();

        return response()->json(['message' => 'Módulo eliminado correctamente']);
    }
}
