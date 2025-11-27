<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sex;
use Illuminate\Http\Request;

class SexController extends Controller
{
    public function index()
    {
        return response()->json(Sex::orderBy('id')->get());
    }
    public function show(Sex $sex)
    {
        return response()->json($sex);
    }
}
