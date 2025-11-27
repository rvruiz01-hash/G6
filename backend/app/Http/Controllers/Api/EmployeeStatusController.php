<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeStatusRequest;
use App\Http\Requests\UpdateEmployeeStatusRequest;
use App\Models\EmployeeStatus;

class EmployeeStatusController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreEmployeeStatusRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(EmployeeStatus $employeeStatus)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateEmployeeStatusRequest $request, EmployeeStatus $employeeStatus)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EmployeeStatus $employeeStatus)
    {
        //
    }
}
