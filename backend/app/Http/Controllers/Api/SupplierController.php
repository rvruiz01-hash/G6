<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class SupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $suppliers = Supplier::with(['bank', 'federalEntity', 'municipality', 'colony'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($suppliers, 200);
        } catch (\Exception $e) {
            Log::error('Error al obtener proveedores: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener los proveedores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Supplier Store - Datos recibidos: ' . json_encode($request->all()));

            // ✅ VALIDACIÓN CORREGIDA
            $validated = $request->validate([
                // Información general
                'contractor_number' => 'required|string|max:10|unique:suppliers,contractor_number',
                'legal_name' => 'required|string|max:190',
                'trade_name' => 'nullable|string|max:200',
                'rfc' => 'nullable|string|size:13|unique:suppliers,rfc',
                
                // Información de contacto
                'contact_person' => 'required|string|max:255',
                'contact_number' => 'nullable|string|max:10',
                'email' => [
                    'required',
                    'email:rfc,dns', // ✅ Usar validación nativa de Laravel
                    'max:100',
                    Rule::unique('suppliers', 'email')
                ],
                'phone' => 'required|string|size:10|regex:/^[0-9]+$/',
                'website' => 'nullable|url|max:255',
                
                // Información bancaria
                // 'bank_id' => 'nullable|exists:banks,id',
                'account_number' => 'nullable|string|max:20',
                'clabe' => 'nullable|string|size:18',
                
                // Dirección fiscal
                'fiscal_address' => 'required|string|max:500',
                'postal_code' => 'nullable|string|size:5',
                'federal_entity_id' => 'nullable|exists:federal_entities,id',
                'municipality_id' => 'nullable|exists:municipalities,id',
                'colony_id' => 'nullable|exists:colonies,id',
                
                // Notas y estado
                'notes' => 'nullable|string',
                'status' => 'required|boolean',
            ], [
                // Mensajes personalizados
                'contractor_number.required' => 'El número de contratista es obligatorio',
                'contractor_number.unique' => 'Este número de contratista ya está registrado',
                'legal_name.required' => 'La razón social es obligatoria',
                'rfc.size' => 'El RFC debe tener exactamente 13 caracteres',
                'rfc.unique' => 'Este RFC ya está registrado',
                'contact_person.required' => 'La persona de contacto es obligatoria',
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El formato del email no es válido',
                'email.unique' => 'Este email ya está registrado',
                'phone.required' => 'El teléfono es obligatorio',
                'phone.max' => 'El teléfono debe de ser de 10 digitos',
                'phone.regex' => 'El teléfono debe de ser solo de digitos',
                'clabe.size' => 'La CLABE debe tener exactamente 18 dígitos',
                'fiscal_address.required' => 'El Domicilio Fiscal es obligatorio',
                'postal_code.size' => 'El código postal debe tener 5 dígitos',
            ]);

            // Crear el proveedor
            $supplier = Supplier::create($validated);

            // Cargar las relaciones
            $supplier->load(['bank', 'federalEntity', 'municipality', 'colony']);

            Log::info('Proveedor creado exitosamente: ' . $supplier->id);

            return response()->json([
                'message' => 'Proveedor creado exitosamente',
                'data' => $supplier
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Errores de validación al crear proveedor: ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Errores de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al crear proveedor: ' . $e->getMessage());
            Log::error('Trace: ' . $e->getTraceAsString());
            return response()->json([
                'message' => 'Error al crear el proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $supplier = Supplier::with(['bank', 'federalEntity', 'municipality', 'colony'])
                ->findOrFail($id);

            return response()->json($supplier, 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Proveedor no encontrado'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error al obtener proveedor: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener el proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $supplier = Supplier::findOrFail($id);

            Log::info('Supplier Update - Datos recibidos: ' . json_encode($request->all()));

            // ✅ VALIDACIÓN CORREGIDA (ignorando el registro actual)
            $validated = $request->validate([
                // Información general
                'contractor_number' => [
                    'required',
                    'string',
                    'max:10',
                    Rule::unique('suppliers', 'contractor_number')->ignore($supplier->id)
                ],
                'legal_name' => 'required|string|max:255',
                'trade_name' => 'nullable|string|max:255',
                'rfc' => [
                    'nullable',
                    'string',
                    'size:13',
                    Rule::unique('suppliers', 'rfc')->ignore($supplier->id)
                ],
                
                // Información de contacto
                'contact_person' => 'nullable|string|max:255',
                'contact_number' => 'nullable|string|max:20',
                'email' => [
                    'required',
                    'email:rfc,dns', // ✅ Usar validación nativa de Laravel
                    'max:255',
                    Rule::unique('suppliers', 'email')->ignore($supplier->id)
                ],
                'phone' => 'required|string|max:10',
                'website' => 'nullable|url|max:255',
                
                // Información bancaria
                'bank_id' => 'nullable|exists:banks,id',
                'account_number' => 'nullable|string|max:20',
                'clabe' => 'nullable|string|size:18',
                
                // Dirección fiscal
                'fiscal_address' => 'nullable|string|max:500',
                'postal_code' => 'nullable|string|size:5',
                'federal_entity_id' => 'nullable|exists:federal_entities,id',
                'municipality_id' => 'nullable|exists:municipalities,id',
                'colony_id' => 'nullable|exists:colonies,id',
                
                // Notas y estado
                'notes' => 'nullable|string',
                'status' => 'required|boolean',
            ], [
                // Mensajes personalizados
                'contractor_number.required' => 'El número de contratista es obligatorio',
                'contractor_number.unique' => 'Este número de contratista ya está registrado',
                'legal_name.required' => 'La razón social es obligatoria',
                'rfc.size' => 'El RFC debe tener exactamente 13 caracteres',
                'rfc.unique' => 'Este RFC ya está registrado',
                'email.required' => 'El email es obligatorio',
                'email.email' => 'El formato del email no es válido',
                'email.unique' => 'Este email ya está registrado',
                'phone.required' => 'El teléfono es obligatorio',
                'bank_id.exists' => 'El banco seleccionado no existe',
                'clabe.size' => 'La CLABE debe tener exactamente 18 dígitos',
                'postal_code.size' => 'El código postal debe tener 5 dígitos',
                'federal_entity_id.exists' => 'La entidad federativa seleccionada no existe',
                'municipality_id.exists' => 'El municipio seleccionado no existe',
                'colony_id.exists' => 'La colonia seleccionada no existe',
            ]);

            // Actualizar el proveedor
            $supplier->update($validated);

            // Cargar las relaciones actualizadas
            $supplier->load(['bank', 'federalEntity', 'municipality', 'colony']);

            Log::info('Proveedor actualizado exitosamente: ' . $supplier->id);

            return response()->json([
                'message' => 'Proveedor actualizado exitosamente',
                'data' => $supplier
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Proveedor no encontrado'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Errores de validación al actualizar proveedor: ' . json_encode($e->errors()));
            return response()->json([
                'message' => 'Errores de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al actualizar proveedor: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar el proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $supplier = Supplier::findOrFail($id);
            
            // Guardar info antes de eliminar para el log
            $supplierInfo = $supplier->contractor_number . ' - ' . $supplier->legal_name;
            
            $supplier->delete();

            Log::info('Proveedor eliminado: ' . $supplierInfo);

            return response()->json([
                'message' => 'Proveedor eliminado exitosamente'
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Proveedor no encontrado'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error al eliminar proveedor: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al eliminar el proveedor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Buscar proveedores por término de búsqueda
     */
    public function search(Request $request)
    {
        try {
            $term = $request->input('term', '');

            $suppliers = Supplier::with(['bank', 'federalEntity', 'municipality', 'colony'])
                ->where(function ($query) use ($term) {
                    $query->where('contractor_number', 'like', "%{$term}%")
                        ->orWhere('legal_name', 'like', "%{$term}%")
                        ->orWhere('trade_name', 'like', "%{$term}%")
                        ->orWhere('rfc', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%");
                })
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($suppliers, 200);
        } catch (\Exception $e) {
            Log::error('Error al buscar proveedores: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al buscar proveedores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener proveedores activos
     */
    public function active()
    {
        try {
            $suppliers = Supplier::with(['bank', 'federalEntity', 'municipality', 'colony'])
                ->where('status', true)
                ->orderBy('legal_name', 'asc')
                ->get();

            return response()->json($suppliers, 200);
        } catch (\Exception $e) {
            Log::error('Error al obtener proveedores activos: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al obtener los proveedores activos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}