<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FederalEntity;
use Illuminate\Http\Request;

class FederalEntityController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /*public function index()
    {
        $entities = FederalEntity::orderBy('name', 'asc')->get();
        return response()->json($entities);
    }

    public function show(FederalEntity $federalEntity)
    {
        return response()->json($federalEntity);
    }*/

    public function index()
    {
        $federalEntities = FederalEntity::all();
        return response()->json($federalEntities);
    }

    public function show($id)
    {
        $federalEntity = FederalEntity::findOrFail($id);
        return response()->json($federalEntity);
    }


}
