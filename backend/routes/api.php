<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\EmployeeController;  
use App\Http\Controllers\Api\RoleController;  
use App\Http\Controllers\Api\RoleUserController;  
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\Api\BusinessLineController;
use App\Http\Controllers\Api\BodyPartController;
use App\Http\Controllers\Api\ColorController;
use App\Http\Controllers\Api\FederalEntityController;
use App\Http\Controllers\Api\SexController;
use App\Http\Controllers\Api\SizeController;
use App\Http\Controllers\Api\UniformTypeController;
use App\Http\Controllers\Api\BankController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\UniformStatusController;
use App\Http\Controllers\Api\MunicipalityController;
use App\Http\Controllers\Api\ColonyController;

use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\PositionController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ClientSiteController;
use App\Http\Controllers\Api\StaffingPlanController;

use App\Http\Controllers\Api\OrganizationChartController;   
use App\Http\Controllers\Api\DepartmentController;


// Rutas públicas
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/refresh', [AuthController::class, 'refresh'])->middleware('jwt.refresh');

// Ruta para fotos de empleados
Route::get('employee-photo/{filename}', function ($filename) {
    $filename = basename($filename);
    $path = storage_path('app/private/employee_photo/' . $filename);
    if (!file_exists($path)) {
        abort(404);
    }
    $mimeType = mime_content_type($path);
    if (!str_starts_with($mimeType, 'image/')) {
        abort(403, 'Archivo no válido');
    }
    return response()->file($path);
})->middleware('auth:api');

// Ruta para archivos de facturas
Route::get('invoice-file/{filename}', function ($filename) {
    $filename = basename($filename);
    $path = storage_path('app/private/invoices/' . $filename);
    
    if (!file_exists($path)) {
        abort(404, 'Archivo no encontrado');
    }
    
    $mimeType = mime_content_type($path);
    $allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!in_array($mimeType, $allowedMimes)) {
        abort(403, 'Tipo de archivo no permitido');
    }
    
    $headers = [
        'Content-Type' => $mimeType,
        'Content-Disposition' => 'inline; filename="' . $filename . '"',
    ];
    
    return response()->file($path, $headers);
})->middleware('auth:api')->name('invoice.file');

// Rutas protegidas
Route::middleware('auth:api')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::get('users', [UserController::class, 'index']);

    // Employee CRUD routes
    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('role-users', RoleUserController::class);
    Route::get('employee/me', [EmployeeController::class, 'me']);
    Route::post('employee/photo', [EmployeeController::class, 'updatePhoto']);

    // Obtener roles del usuario autenticado
    Route::get('Logged_User_Roles', [UserController::class, 'Logged_User_Roles']);

    Route::apiResource('modules', ModuleController::class);
    
    // Rutas para los catálogos 
    Route::apiResource('business-lines', BusinessLineController::class);
    Route::apiResource('body-parts', BodyPartController::class);
    Route::apiResource('colors', ColorController::class);
    Route::apiResource('federal-entities', FederalEntityController::class);
    Route::apiResource('sexes', SexController::class);
    Route::apiResource('sizes', SizeController::class);
    Route::apiResource('uniform-types', UniformTypeController::class);
    Route::apiResource('banks', BankController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('branches', BranchController::class);
    
    // Rutas de facturas
    Route::apiResource('invoices', InvoiceController::class);
    Route::get('invoices/sizes-by-uniform/{uniformTypeId}', [InvoiceController::class, 'getSizesByUniformType']);
    Route::post('invoices/{id}/upload-file', [InvoiceController::class, 'uploadFile']);
    Route::get('invoices/colors-by-uniform/{uniformTypeId}', [InvoiceController::class, 'getColorsByUniformType']);
    Route::patch('invoices/{id}/update-payment-status', [InvoiceController::class, 'updatePaymentStatus']);
    Route::get('invoices/uniform-options/{uniformTypeId}', [InvoiceController::class, 'getUniformOptions']);
    
    // Rutas de estatus de uniformes (solo lectura)
    Route::get('uniform-statuses', [UniformStatusController::class, 'index']);
    Route::get('uniform-statuses/{id}', [UniformStatusController::class, 'show']);
    
    // Municipios y Colonias
    Route::apiResource('municipalities', MunicipalityController::class);
    Route::apiResource('colonies', ColonyController::class);
    
    // Búsquedas por código postal, estado, municipio
    Route::get('colonies/by-postal-code/{postalCode}', [ColonyController::class, 'getByPostalCode']);
    Route::get('colonies/by-municipality/{municipalityId}', [ColonyController::class, 'getByMunicipality']);
    Route::get('colonies/{id}/postal-code', [ColonyController::class, 'getPostalCode']);
    Route::get('municipalities/by-state/{stateId}', [MunicipalityController::class, 'getByState']);
    
    // ========================================================================
    // RUTAS PARA EL MÓDULO DE COTIZADOR
    // ========================================================================
    Route::prefix('quoter')->group(function () {
        
        // Días festivos
        Route::get('holiday-days', [App\Http\Controllers\Api\HolidayDayController::class, 'index']);
        Route::get('holiday-days/{id}', [App\Http\Controllers\Api\HolidayDayController::class, 'show']);
        
        // Cobro día 31
        Route::get('day-31-charges', [App\Http\Controllers\Api\Day31ChargeController::class, 'index']);
        Route::get('day-31-charges/current', [App\Http\Controllers\Api\Day31ChargeController::class, 'current']);
        
        // Antigüedad
        Route::get('seniorities', [App\Http\Controllers\Api\SeniorityController::class, 'index']);
        Route::get('seniorities/years/{years}', [App\Http\Controllers\Api\SeniorityController::class, 'getByYears']);
        
        // UMA
        Route::get('umas', [App\Http\Controllers\Api\UmaController::class, 'index']);
        Route::get('umas/current', [App\Http\Controllers\Api\UmaController::class, 'current']);
        
        // Salarios
        Route::get('salaries', [App\Http\Controllers\Api\SalaryController::class, 'index']);
        Route::get('salaries/current', [App\Http\Controllers\Api\SalaryController::class, 'current']);
        
        // Conceptos IMSS
        Route::get('imss-concepts', [App\Http\Controllers\Api\ImssConceptController::class, 'index']);
        Route::get('imss-concepts/{id}', [App\Http\Controllers\Api\ImssConceptController::class, 'show']);
        
        // Primas de riesgo
        Route::get('work-risk-premiums', [App\Http\Controllers\Api\WorkRiskPremiumController::class, 'index']);
        Route::get('work-risk-premiums/current', [App\Http\Controllers\Api\WorkRiskPremiumController::class, 'current']);
        
        // ISR Mensual
        Route::get('monthly-isr', [App\Http\Controllers\Api\MonthlyIsrController::class, 'index']);
        Route::get('monthly-isr/calculate/{amount}', [App\Http\Controllers\Api\MonthlyIsrController::class, 'calculateByAmount']);
        
        // Porcentajes por entidad
        Route::get('entity-percentages', [App\Http\Controllers\Api\EntityPercentageController::class, 'index']);
        Route::post('entity-percentages/search', [App\Http\Controllers\Api\EntityPercentageController::class, 'getByEntityAndLine']);

        // Tipos de turno
        Route::get('shift-types', [App\Http\Controllers\Api\ShiftTypeController::class, 'index']);
        Route::get('shift-types/business-line/{businessLineId}', [App\Http\Controllers\Api\ShiftTypeController::class, 'getByBusinessLine']);
        Route::get('shift-types/{id}', [App\Http\Controllers\Api\ShiftTypeController::class, 'show']);
        
        // ✅ COTIZADOR - RUTAS PRINCIPALES (SIN DUPLICADOS)
        Route::post('calculate', [App\Http\Controllers\Api\QuoterController::class, 'calculate']);
        Route::post('generate-pdf', [App\Http\Controllers\Api\QuoterController::class, 'generatePdf']);
    });

    // ========================================================================
    // RUTAS PARA UNIFORMES (si las necesitas)
    // ========================================================================
    Route::prefix('uniforms')->group(function () {
        // Route::get('/sexes', [UniformController::class, 'getSexes']);
        // Route::get('/body-parts', [UniformController::class, 'getBodyParts']);
        // Route::get('/types', [UniformController::class, 'getUniformTypes']); 
        // Route::get('/options', [UniformController::class, 'getUniformOptions']); 
        // Route::get('/max-price', [UniformController::class, 'getMaxUnitPrice']); 
    });

    Route::apiResource('departments', DepartmentController::class);
        // Rutas adicionales
    Route::get('/{id}/positions', [DepartmentController::class, 'positions']);
    Route::get('/{id}/statistics', [DepartmentController::class, 'statistics']);

    // Regions
    // Route::apiResource('regions', [RegionController::class, 'index']);
    Route::apiResource('regions', RegionController::class);
    Route::apiResource('positions', PositionController::class);

    Route::prefix('positions')->group(function () {
        Route::get('{id}/hierarchy', [PositionController::class, 'hierarchy']);
        Route::get('{id}/hierarchy-path', [PositionController::class, 'hierarchyPath']);
        Route::get('{id}/subordinates', [PositionController::class, 'subordinates']);
        // Auxiliares
        Route::get('available-supervisors/list', [PositionController::class, 'availableSupervisors']);
        Route::get('organizational-chart/view', [PositionController::class, 'organizationalChart']);
        Route::get('by-business-line/list', [PositionController::class, 'getByBusinessLine']);
    });

    Route::apiResource('clients', ClientController::class);
    Route::apiResource('client-sites', ClientSiteController::class);
    Route::apiResource('staffing-plans', StaffingPlanController::class);});