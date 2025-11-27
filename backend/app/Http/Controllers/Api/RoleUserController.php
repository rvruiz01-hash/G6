<?php

namespace App\Http\Controllers\Api;

use App\Models\RoleUser;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class RoleUserController extends Controller
{
    public function index()
    {
        $roleUsers = RoleUser::with(['user', 'role'])->get();
        return response()->json($roleUsers);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
            'is_primary' => 'boolean',
        ]);

        $roleUser = RoleUser::create($data);
        return response()->json($roleUser, 201);
    }

    public function show($id)
    {
        $roleUser = RoleUser::with(['user', 'role'])->findOrFail($id);
        return response()->json($roleUser);
    }

    public function update(Request $request, $id)
    {
        $roleUser = RoleUser::findOrFail($id);

        $data = $request->validate([
            'is_primary' => 'boolean',
        ]);

        $roleUser->update($data);
        return response()->json($roleUser);
    }

    public function destroy($id)
    {
        $roleUser = RoleUser::findOrFail($id);
        $roleUser->delete();
        return response()->json(null, 204);
    }
}
