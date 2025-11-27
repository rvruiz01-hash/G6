<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffingPlanRequest;
use App\Http\Requests\UpdateStaffingPlanRequest;
use App\Models\StaffingPlan;

class StaffingPlanController extends Controller
{
     public function index()
    {
        $staffingPlans = StaffingPlan::all();
        return response()->json($staffingPlans);
    }

    public function show($id)
    {
        $staffingPlan = StaffingPlan::findOrFail($id);
        return response()->json($staffingPlan);
    }

}