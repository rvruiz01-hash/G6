<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Models\Department;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Department::query();

            // Search filter
            if ($request->has('search') && $request->search) {
                $query->search($request->search);
            }

            // Load relationships count
            $query->withCount('positions');

            // Sort
            $sortBy = $request->get('sort_by', 'id');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination or all
            if ($request->has('paginate') && $request->paginate === 'true') {
                $perPage = $request->get('per_page', 15);
                $departments = $query->paginate($perPage);
            } else {
                $departments = $query->get();
            }

            return response()->json($departments, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener departamentos',
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
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:departments,name',
            ], [
                'name.required' => 'El nombre del departamento es obligatorio.',
                'name.string' => 'El nombre debe ser texto.',
                'name.max' => 'El nombre no puede exceder 255 caracteres.',
                'name.unique' => 'Este departamento ya existe.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $department = Department::create([
                'name' => strtoupper($request->name),
            ]);

            return response()->json($department, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el departamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $department = Department::with(['positions.businessLine', 'positions.reportsTo'])
                ->withCount('positions')
                ->findOrFail($id);

            return response()->json($department, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Departamento no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el departamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $department = Department::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:departments,name,' . $id,
            ], [
                'name.required' => 'El nombre del departamento es obligatorio.',
                'name.string' => 'El nombre debe ser texto.',
                'name.max' => 'El nombre no puede exceder 255 caracteres.',
                'name.unique' => 'Este departamento ya existe.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $department->update([
                'name' => strtoupper($request->name),
            ]);

            return response()->json($department, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Departamento no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el departamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $department = Department::findOrFail($id);

            // Check if department has positions
            if ($department->positions()->count() > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar un departamento que tiene posiciones asignadas.',
                    'positions_count' => $department->positions()->count()
                ], 400);
            }

            $department->delete();

            return response()->json([
                'message' => 'Departamento eliminado exitosamente'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Departamento no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el departamento',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function positions(int $id): JsonResponse
    {
        try {
            $department = Department::findOrFail($id);
            
            $positions = $department->positions()
                ->with(['businessLine', 'reportsTo', 'subordinates'])
                ->orderBy('level')
                ->orderBy('name')
                ->get();

            return response()->json([
                'department' => $department,
                'positions' => $positions,
                'total' => $positions->count()
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Departamento no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las posiciones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get department statistics.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function statistics(int $id): JsonResponse
    {
        try {
            $department = Department::findOrFail($id);
            
            $stats = [
                'total_positions' => $department->positions()->count(),
                'positions_by_level' => $department->positions()
                    ->selectRaw('level, COUNT(*) as count')
                    ->groupBy('level')
                    ->orderBy('level')
                    ->get(),
                'top_level_positions' => $department->positions()
                    ->whereNull('reports_to_position_id')
                    ->count(),
            ];

            return response()->json([
                'department' => $department,
                'statistics' => $stats
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Departamento no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
