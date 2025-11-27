<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;


class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /*public function index(): JsonResponse
    {
        try {
            $employees = Employee::with('user')->paginate(15);
            
            return response()->json([
                'success' => true,
                'data' => $employees,
                'message' => 'Employees retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving employees: ' . $e->getMessage()
            ], 500);
        }*/
            public function index()
    {
        // Devuelve todos los empleados con los campos necesarios
        $employees = Employee::select([
            'id',
            'name',
            'paternal_last_name',
            'maternal_last_name',
            'email',
            'cellphone_number',
            'photo',
            'position_id',
            'manager_id',
            'staffing_plan_id'
        ])
        ->whereIn('employee_status_id', [2, 3]) 
        ->get();

        return response()->json($employees);
    }
    

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            
            // Handle photo upload
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('employees/photos', 'public');
                $validated['photo_path'] = $photoPath;
            }

            $employee = Employee::create($validated);
            $employee->load('user');

            return response()->json([
                'success' => true,
                'data' => $employee,
                'message' => 'Employee created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating employee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    /*public function show(Employee $employee): JsonResponse
    {
        try {
            $employee->load('user');
            
            return response()->json([
                'success' => true,
                'data' => $employee,
                'message' => 'Employee retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving employee: ' . $e->getMessage()
            ], 500);
        }
    }*/

        
        public function show($id)
    {
        $employee = Employee::findOrFail($id);
        return response()->json($employee);
    }
    

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        try {
            $validated = $request->validated();
            
            // Handle photo upload
            if ($request->hasFile('photo')) {
                // Delete old photo if exists
                if ($employee->photo_path && Storage::disk('public')->exists($employee->photo_path)) {
                    Storage::disk('public')->delete($employee->photo_path);
                }
                
                $photoPath = $request->file('photo')->store('employees/photos', 'public');
                $validated['photo_path'] = $photoPath;
            }

            $employee->update($validated);
            $employee->load('user');

            return response()->json([
                'success' => true,
                'data' => $employee,
                'message' => 'Employee updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating employee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee): JsonResponse
    {
        try {
            // Delete photo if exists
            if ($employee->photo_path && Storage::disk('public')->exists($employee->photo_path)) {
                Storage::disk('public')->delete($employee->photo_path);
            }
            
            $employee->delete();

            return response()->json([
                'success' => true,
                'message' => 'Employee deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting employee: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current authenticated user's employee profile.
     */
    public function me(): JsonResponse
    {
        try {
            $employee = Employee::where('user_id', Auth::id())->with('user')->first();
            
            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee profile not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $employee,
                'message' => 'Employee profile retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving employee profile: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update current authenticated user's photo.
     */
    public function updatePhoto(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $employee = Employee::where('user_id', Auth::id())->first();
            
            if (!$employee) {
                return response()->json([
                    'success' => false,
                    'message' => 'Employee profile not found'
                ], 404);
            }

            // Delete old photo if exists
            if ($employee->photo_path && Storage::disk('public')->exists($employee->photo_path)) {
                Storage::disk('public')->delete($employee->photo_path);
            }

            // Store new photo
            $photoPath = $request->file('photo')->store('employees/photos', 'public');
            $employee->update(['photo_path' => $photoPath]);
            $employee->load('user');

            return response()->json([
                'success' => true,
                'data' => $employee,
                'message' => 'Photo updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating photo: ' . $e->getMessage()
            ], 500);
        }
    }
}