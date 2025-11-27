<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRegionRequest;
use App\Http\Requests\UpdateRegionRequest;
use App\Models\Region;

class RegionController extends Controller
{
    public function index()
    {
        $regions = Region::all();
        return response()->json($regions);
    }

    public function show($id)
    {
        $region = Region::findOrFail($id);
        return response()->json($region);
    }
}
