<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use App\Http\Requests\StorePositionRequest;
use App\Http\Requests\UpdatePositionRequest;
use App\Models\Position;

class PositionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Position::query();

            // Load relationships
            $query->with(['department', 'businessLine', 'reportsTo']);

            // Search filter
            if ($request->has('search') && $request->search) {
                $query->search($request->search);
            }

            // Department filter
            if ($request->has('department_id') && $request->department_id) {
                $query->byDepartment($request->department_id);
            }

            // Business line filter
            if ($request->has('business_line_id') && $request->business_line_id) {
                $query->byBusinessLine($request->business_line_id);
            }

            // Level filter
            if ($request->has('level') && $request->level) {
                $query->byLevel($request->level);
            }

            // Top level filter
            if ($request->has('top_level') && $request->top_level === 'true') {
                $query->topLevel();
            }

            // Sort
            $sortBy = $request->get('sort_by', 'level');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Secondary sort by name
            if ($sortBy !== 'name') {
                $query->orderBy('name', 'asc');
            }

            // Pagination or all
            if ($request->has('paginate') && $request->paginate === 'true') {
                $perPage = $request->get('per_page', 15);
                $positions = $query->paginate($perPage);
            } else {
                $positions = $query->get();
            }

            return response()->json($positions, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener posiciones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created position.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:positions,name',
                'level' => 'required|integer|min:1|max:10',
                'business_line_id' => [
                    'required',
                    'integer',
                    Rule::exists('business_lines', 'id')->where(function ($query) {
                        $query->where('status', true);
                    }),
                ],
                'department_id' => 'required|integer|exists:departments,id',
                'reports_to_position_id' => 'nullable|integer|exists:positions,id',
            ], [
                'name.required' => 'El nombre de la posición es obligatorio.',
                'name.unique' => 'Esta posición ya existe.',
                'level.required' => 'El nivel es obligatorio.',
                'level.integer' => 'El nivel debe ser un número entero.',
                'level.min' => 'El nivel mínimo es 1.',
                'level.max' => 'El nivel máximo es 10.',
                'business_line_id.required' => 'La línea de negocio es obligatoria.',
                'business_line_id.exists' => 'La línea de negocio seleccionada no existe o no está activa.',
                'department_id.required' => 'El departamento es obligatorio.',
                'department_id.exists' => 'El departamento seleccionado no existe.',
                'reports_to_position_id.exists' => 'La posición superior seleccionada no existe.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // ✅ Validación adicional: La posición supervisor debe estar en la misma línea de negocio
            if ($request->reports_to_position_id) {
                $reportsTo = Position::find($request->reports_to_position_id);
                
                // Validar que esté en la misma línea de negocio
                if ($reportsTo && $reportsTo->business_line_id !== (int)$request->business_line_id) {
                    return response()->json([
                        'message' => 'Error de validación',
                        'errors' => [
                            'reports_to_position_id' => [
                                'La posición superior debe pertenecer a la misma línea de negocio.'
                            ]
                        ]
                    ], 422);
                }
                
                // Validar nivel
                if ($reportsTo && $reportsTo->level >= $request->level) {
                    return response()->json([
                        'message' => 'Error de validación',
                        'errors' => [
                            'reports_to_position_id' => [
                                'La posición superior debe tener un nivel menor al de esta posición.'
                            ]
                        ]
                    ], 422);
                }
            }

            $position = Position::create([
                'name' => strtoupper($request->name),
                'level' => $request->level,
                'business_line_id' => $request->business_line_id,
                'department_id' => $request->department_id,
                'reports_to_position_id' => $request->reports_to_position_id,
            ]);

            // Load relationships
            $position->load(['department', 'businessLine', 'reportsTo']);

            return response()->json($position, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear la posición',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified position.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        try {
            $position = Position::with([
                'department',
                'businessLine',
                'reportsTo',
                'subordinates.department',
            ])->findOrFail($id);

            return response()->json($position, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Posición no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener la posición',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified position.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $position = Position::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:positions,name,' . $id,
                'level' => 'required|integer|min:1|max:10',
                'business_line_id' => [
                    'required',
                    'integer',
                    Rule::exists('business_lines', 'id')->where(function ($query) {
                        $query->where('status', true);
                    }),
                ],
                'department_id' => 'required|integer|exists:departments,id',
                'reports_to_position_id' => [
                    'nullable',
                    'integer',
                    'exists:positions,id',
                    'different:id',
                ],
            ], [
                'name.required' => 'El nombre de la posición es obligatorio.',
                'name.unique' => 'Esta posición ya existe.',
                'level.required' => 'El nivel es obligatorio.',
                'level.integer' => 'El nivel debe ser un número entero.',
                'level.min' => 'El nivel mínimo es 1.',
                'level.max' => 'El nivel máximo es 10.',
                'business_line_id.required' => 'La línea de negocio es obligatoria.',
                'business_line_id.exists' => 'La línea de negocio seleccionada no existe o no está activa.',
                'department_id.required' => 'El departamento es obligatorio.',
                'department_id.exists' => 'El departamento seleccionado no existe.',
                'reports_to_position_id.exists' => 'La posición superior seleccionada no existe.',
                'reports_to_position_id.different' => 'Una posición no puede reportar a sí misma.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // ✅ Validación adicional: La posición supervisor debe estar en la misma línea de negocio
            if ($request->reports_to_position_id) {
                $reportsTo = Position::find($request->reports_to_position_id);
                
                // Validar que esté en la misma línea de negocio
                if ($reportsTo && $reportsTo->business_line_id !== (int)$request->business_line_id) {
                    return response()->json([
                        'message' => 'Error de validación',
                        'errors' => [
                            'reports_to_position_id' => [
                                'La posición superior debe pertenecer a la misma línea de negocio.'
                            ]
                        ]
                    ], 422);
                }
                
                // Validar nivel
                if ($reportsTo && $reportsTo->level >= $request->level) {
                    return response()->json([
                        'message' => 'Error de validación',
                        'errors' => [
                            'reports_to_position_id' => [
                                'La posición superior debe tener un nivel menor al de esta posición.'
                            ]
                        ]
                    ], 422);
                }
            }

            $position->update([
                'name' => strtoupper($request->name),
                'level' => $request->level,
                'business_line_id' => $request->business_line_id,
                'department_id' => $request->department_id,
                'reports_to_position_id' => $request->reports_to_position_id,
            ]);

            // Load relationships
            $position->load(['department', 'businessLine', 'reportsTo']);

            return response()->json($position, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Posición no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la posición',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified position.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $position = Position::findOrFail($id);

            // Check if position has subordinates
            $subordinatesCount = $position->subordinates()->count();
            if ($subordinatesCount > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar una posición que tiene subordinados.',
                    'subordinates_count' => $subordinatesCount
                ], 400);
            }

            $position->delete();

            return response()->json([
                'message' => 'Posición eliminada exitosamente'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Posición no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar la posición',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get the hierarchy tree for a position (all subordinates recursively).
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function hierarchy(int $id): JsonResponse
    {
        try {
            $position = Position::with([
                'department',
                'businessLine',
                'reportsTo',
            ])->findOrFail($id);

            $subordinates = $this->buildHierarchyTree($position);

            return response()->json([
                'position' => $position,
                'hierarchy' => $subordinates,
                'total_subordinates' => $position->getAllSubordinates()->count()
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Posición no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener la jerarquía',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Build hierarchy tree recursively.
     *
     * @param  Position  $position
     * @return array
     */
    private function buildHierarchyTree(Position $position): array
    {
        $subordinates = $position->subordinates()
            ->with(['department', 'businessLine'])
            ->get();

        return $subordinates->map(function ($sub) {
            return [
                'position' => $sub,
                'subordinates' => $this->buildHierarchyTree($sub),
            ];
        })->toArray();
    }

    /**
     * Get the hierarchy path for a position (all supervisors up to top).
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function hierarchyPath(int $id): JsonResponse
    {
        try {
            $position = Position::with(['department', 'businessLine'])->findOrFail($id);
            $path = $position->getHierarchyPath();

            return response()->json([
                'position' => $position,
                'path' => $path,
                'levels_up' => $path->count() - 1
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Posición no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el camino jerárquico',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all subordinates for a position.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function subordinates(int $id): JsonResponse
    {
        try {
            $position = Position::findOrFail($id);

            $subordinates = $position->subordinates()
                ->with(['department', 'businessLine', 'reportsTo'])
                ->orderBy('level')
                ->orderBy('name')
                ->get();

            return response()->json([
                'position' => $position,
                'direct_subordinates' => $subordinates,
                'total_subordinates' => $position->getAllSubordinates()->count()
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Posición no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener subordinados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available positions that can be supervisors for a given position.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function availableSupervisors(Request $request): JsonResponse
    {
        try {
            $positionId = $request->get('position_id');
            $level = $request->get('level');
            $departmentId = $request->get('department_id');

            $query = Position::query();

            // Exclude the position itself if editing
            if ($positionId) {
                $query->where('id', '!=', $positionId);
            }

            // Only positions with lower level can be supervisors
            if ($level) {
                $query->where('level', '<', $level);
            }

            // Optionally filter by same department
            if ($departmentId) {
                $query->where('department_id', $departmentId);
            }

            $positions = $query->with(['department', 'businessLine'])
                ->orderBy('level')
                ->orderBy('name')
                ->get();

            return response()->json($positions, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener supervisores disponibles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ NUEVO: Obtener posiciones por línea de negocio
     * Esta ruta filtra automáticamente las posiciones según la línea de negocio seleccionada
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByBusinessLine(Request $request): JsonResponse
    {
        try {
            $businessLineId = $request->get('business_line_id');
            $excludePositionId = $request->get('exclude_position_id'); // Para excluir la posición actual al editar

            if (!$businessLineId) {
                return response()->json([
                    'message' => 'El parámetro business_line_id es requerido'
                ], 400);
            }

            $query = Position::where('business_line_id', $businessLineId)
                ->with(['department', 'businessLine']);

            // Excluir posición actual si se está editando
            if ($excludePositionId) {
                $query->where('id', '!=', $excludePositionId);
            }

            $positions = $query->orderBy('level')
                ->orderBy('name')
                ->get();

            return response()->json($positions, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener posiciones por línea de negocio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get organizational chart starting from top-level positions.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function organizationalChart(): JsonResponse
    {
        try {
            $topLevelPositions = Position::topLevel()
                ->with(['department', 'businessLine'])
                ->orderBy('level')
                ->orderBy('name')
                ->get();

            $chart = $topLevelPositions->map(function ($position) {
                return [
                    'position' => $position,
                    'subordinates' => $this->buildHierarchyTree($position),
                ];
            });

            return response()->json([
                'organizational_chart' => $chart,
                'total_top_level_positions' => $topLevelPositions->count(),
                'total_positions' => Position::count()
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el organigrama',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}