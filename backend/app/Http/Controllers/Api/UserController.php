<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = User::query();

        if(request()->has('include')){
            $includes = explode(',', request('include'));
            $query->with($includes);
        }
        $users = $query->get();
        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
    }

public function Logged_User_Roles()
{
    $user = auth()->user();

    // Obtener todos los roles con módulos asociados (incluyendo TODOS los campos)
    $roles = $user->roles()
        ->with(['modules' => function ($query) {
            $query->where('status', true)
                  ->select('modules.*'); // 👈 Asegura que todos los campos se carguen
        }])
        ->get();

    // Transformar módulos en estructura anidada
    $roles->each(function ($role) {
        $modules = $role->modules;
        $role->setRelation('modules', $this->buildModuleTree($modules));
    });

    $primaryRoleId = $roles->firstWhere('pivot.is_primary', 1)?->id;

    return response()->json([
        'success' => true,
        'data' => [
            'user' => [
                'id' => $user->id,
                'name' => $user->getFullNameAttribute(),
                'photo' => $user->photo,
            ],
            'roles' => $roles,
            'primaryRoleId' => $primaryRoleId,
        ]
    ]);
}

/**
 * Convierte una colección plana de módulos en árbol anidado
 */
private function buildModuleTree($modules)
{
    $grouped = $modules->groupBy('parent_id');

    $build = function ($parentId) use (&$build, $grouped) {
        return ($grouped[$parentId] ?? collect())->map(function ($module) use (&$build) {
            // 👇 Crear estructura con todos los campos necesarios
            $moduleData = [
                'id' => $module->id,
                'name' => $module->name,
                'icon_svg' => $module->icon_svg, // 👈 Asegúrate que este campo existe en tu tabla
                'path' => $module->path,
                'parent_id' => $module->parent_id,
                'status' => $module->status,
            ];
            
            // Construir submódulos recursivamente
            $subModules = $build($module->id);
            
            if ($subModules->isNotEmpty()) {
                $moduleData['subModules'] = $subModules;
            }
            
            return $moduleData;
        });
    };

    // 1. Obtener módulos raíz (los que no tienen parent_id)
    $roots = $build(null);

    // 2. Detectar módulos huérfanos
    $orphans = $modules->filter(function ($module) use ($modules) {
        return $module->parent_id !== null &&
               !$modules->contains('id', $module->parent_id);
    })->map(function ($module) use (&$build) {
        return [
            'id' => $module->id,
            'name' => $module->name,
            'icon_svg' => $module->icon_svg,
            'path' => $module->path,
            'parent_id' => $module->parent_id,
            'status' => $module->status,
            'subModules' => $build($module->id),
        ];
    });

    // 3. Agregar huérfanos como raíces
    return $roots->merge($orphans)->values();
}

}
