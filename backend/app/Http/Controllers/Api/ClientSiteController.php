<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientSiteRequest;
use App\Http\Requests\UpdateClientSiteRequest;
use App\Models\ClientSite;

class ClientSiteController extends Controller
{
    public function index()
    {
        $clientSites = ClientSite::with(['businessLine', 'federalEntity'])
            ->get(['id', 'business_line_id', 'federal_entity_id']);
        
        return response()->json($clientSites);
    }

    public function show($id)
    {
        $clientSite = ClientSite::with(['businessLine', 'federalEntity', 'staffingPlans'])
            ->findOrFail($id);
        
        return response()->json($clientSite);
    }

}
