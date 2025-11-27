<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BusinessLine;
use Illuminate\Support\Facades\Validator;

class BusinessLineController extends Controller
{
    // GET /api/business-lines
    public function index()
    {
        // return response()->json(BusinessLine::all(), 200);
        $businessLines = BusinessLine::where('status', true)
            ->orderBy('name')
            ->get(['id', 'name']);
        
        return response()->json($businessLines);
    }
    // POST /api/business-lines
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:30|unique:business_lines,name',
            'status' => 'required|boolean',
        ], [
                'name.required' => 'La descripción es obligatoria',
                'name.unique' => 'Esta linea de negocio ya existe',
                'name.max' => 'La descripción no puede exceder 30 caracteres',
            ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $businessLine = BusinessLine::create($validator->validated());

        return response()->json($businessLine, 201);
    }

    public function show($id)
    {
        $businessLine = BusinessLine::findOrFail($id);
        return response()->json($businessLine);
    }

}
