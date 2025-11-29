<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\UniformStock;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/invoices
     */
    public function index(): JsonResponse
    {
        try {
            $invoices = Invoice::with([
                'supplier:id,legal_name,rfc',
                'businessLine:id,name',
                'federalEntity:id,name',
                'branch:id,name,code',
                'uniformStock.uniformType:id,description',
                'uniformStock.size:id,description',
                'uniformStock.uniformStatus:id,description',
            ])
            ->orderBy('created_at', 'desc')
            ->get();
            
            return response()->json($invoices, 200);
        } catch (\Exception $e) {
            Log::error('Error en Invoice index:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error al obtener las facturas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            // ✅ LOG: Ver qué datos llegan
            Log::info('Invoice Store - Datos recibidos:', [
                'all_data' => $request->all(),
                'merchandise_paid' => $request->input('merchandise_paid'),
                'invoice_paid' => $request->input('invoice_paid'),
            ]);

            // ✅ Convertir booleanos
            $merchandisePaid = $this->convertToBoolean($request->input('merchandise_paid', false));
            $invoicePaid = $this->convertToBoolean($request->input('invoice_paid', false));

            // Validación de los datos de la factura
            $validated = $request->validate([
                'folio' => 'required|string|max:20|unique:invoices,folio',
                'supplier_id' => 'required|exists:suppliers,id',
                'business_line_id' => 'required|exists:business_lines,id',
                'payment_type' => 'required|in:CONTADO,CREDITO',
                'payment_months' => 'nullable|integer|min:1|max:12',
                'federal_entity_id' => 'required|exists:federal_entities,id',
                'branch_id' => 'required|exists:branches,id',
                
                // ✅ NUEVOS CAMPOS DE AJUSTES
                'shipping_cost' => 'nullable|numeric|min:0',
                'freight_withholding' => 'nullable|numeric|min:0',
                'discount' => 'nullable|numeric|min:0',
                
                // Validación del array de uniformes
                'uniforms' => 'required|array|min:1',
                'uniforms.*.uniform_type_id' => 'required|exists:uniform_types,id',
                'uniforms.*.size_id' => 'required|exists:sizes,id',
                'uniforms.*.color_id' => 'required|exists:colors,id',
                'uniforms.*.quantity' => 'required|integer|min:1',
                'uniforms.*.unit_price' => 'required|numeric|min:0',
                
                // Validación del archivo (opcional)
                'invoice_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            ], [
                'folio.required' => 'El folio es obligatorio',
                'folio.unique' => 'Este folio ya existe',
                'folio.max' => 'El folio no puede exceder 20 caracteres',
                'supplier_id.required' => 'El proveedor es obligatorio',
                'supplier_id.exists' => 'El proveedor seleccionado no existe',
                'business_line_id.required' => 'El segmento de negocio es obligatoria',
                'business_line_id.exists' => 'El segmento de negocio seleccionada no existe',
                'payment_type.required' => 'El tipo de pago es obligatorio',
                'payment_type.in' => 'El tipo de pago debe ser CONTADO o CREDITO',
                'payment_months.min' => 'Los meses de crédito deben ser al menos 1',
                'payment_months.max' => 'Los meses de crédito no pueden exceder 12',
                'federal_entity_id.required' => 'La entidad federativa es obligatoria',
                'federal_entity_id.exists' => 'La entidad federativa seleccionada no existe',
                'branch_id.required' => 'La sucursal es obligatoria',
                'branch_id.exists' => 'La sucursal seleccionada no existe',
                'shipping_cost.numeric' => 'El costo de envío debe ser un número',
                'shipping_cost.min' => 'El costo de envío no puede ser negativo',
                'freight_withholding.numeric' => 'La retención por flete debe ser un número',
                'freight_withholding.min' => 'La retención por flete no puede ser negativa',
                'discount.numeric' => 'El descuento debe ser un número',
                'discount.min' => 'El descuento no puede ser negativo',
                'uniforms.required' => 'Debe agregar al menos un uniforme',
                'uniforms.min' => 'Debe agregar al menos un uniforme',
                'invoice_file.mimes' => 'El archivo debe ser PDF, JPG, JPEG o PNG',
                'invoice_file.max' => 'El archivo no puede exceder 10MB',
            ]);

            // Validar que si es CREDITO, tenga meses
            if ($validated['payment_type'] === 'CREDITO' && empty($validated['payment_months'])) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => [
                        'payment_months' => ['Los meses de crédito son obligatorios cuando el pago es a crédito']
                    ]
                ], 422);
            }

            // Validar que si es CONTADO, no tenga meses
            if ($validated['payment_type'] === 'CONTADO') {
                $validated['payment_months'] = null;
            }

            // ✅ CALCULAR TOTALES CON AJUSTES
            $subtotalUniforms = 0;
            foreach ($validated['uniforms'] as $uniform) {
                $subtotalUniforms += ($uniform['quantity'] * $uniform['unit_price']);
            }

            // Obtener los ajustes (default 0 si no vienen)
            $shippingCost = floatval($validated['shipping_cost'] ?? 0);
            $freightWithholding = floatval($validated['freight_withholding'] ?? 0);
            $discount = floatval($validated['discount'] ?? 0);

            // Calcular subtotal ajustado
            $subtotal = $subtotalUniforms + $shippingCost + $freightWithholding - $discount;
            $iva = $subtotal * 0.16; // 16% de IVA
            $total = $subtotal + $iva;

            // Manejar el archivo si existe
            $invoiceFilePath = null;
            if ($request->hasFile('invoice_file')) {
                try {
                    $file = $request->file('invoice_file');
                    $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                    $invoiceFilePath = $file->storeAs('invoices', $filename, 'private');
                    
                    Log::info('Archivo guardado exitosamente:', ['path' => $invoiceFilePath]);
                } catch (\Exception $e) {
                    Log::error('Error al guardar archivo:', [
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // Usar transacción para garantizar atomicidad
            DB::beginTransaction();

            try {
                // Crear la factura
                $invoice = Invoice::create([
                    'folio' => $validated['folio'],
                    'supplier_id' => $validated['supplier_id'],
                    'business_line_id' => $validated['business_line_id'],
                    'payment_type' => $validated['payment_type'],
                    'payment_months' => $validated['payment_months'],
                    'subtotal' => $subtotal,
                    'iva' => $iva,
                    'total' => $total,
                    'shipping_cost' => $shippingCost,           // ✅ NUEVO
                    'freight_withholding' => $freightWithholding, // ✅ NUEVO
                    'discount' => $discount,                    // ✅ NUEVO
                    'federal_entity_id' => $validated['federal_entity_id'],
                    'branch_id' => $validated['branch_id'],
                    'merchandise_paid' => $merchandisePaid,
                    'invoice_paid' => $invoicePaid,
                    'invoice_file' => $invoiceFilePath,
                ]);

                Log::info('Factura creada exitosamente:', ['invoice_id' => $invoice->id]);

                // Crear los registros de stock INDIVIDUALES
                foreach ($validated['uniforms'] as $uniformData) {
                    $quantity = $uniformData['quantity'];
                    $unitPrice = $uniformData['unit_price'];
                    
                    // Crear registros individuales (uno por cada unidad)
                    for ($i = 1; $i <= $quantity; $i++) {
                        $code = $this->generateUniqueCode(
                            $uniformData['uniform_type_id'],
                            $uniformData['size_id'],
                            $uniformData['color_id'],
                            $i,
                        );
                        
                        UniformStock::create([
                            'invoice_id' => $invoice->id,
                            'uniform_type_id' => $uniformData['uniform_type_id'],
                            'size_id' => $uniformData['size_id'],
                            'color_id' => $uniformData['color_id'],
                            'code' => $code,
                            'quantity' => 1,
                            'unit_price' => $unitPrice,
                            'subtotal' => $unitPrice,
                            'uniform_status_id' => 1,
                        ]);
                    }
                }

                Log::info('Stock de uniformes creado exitosamente');

                DB::commit();

                // Cargar las relaciones para la respuesta
                $invoice->load([
                    'supplier:id,legal_name,rfc',
                    'businessLine:id,name',
                    'federalEntity:id,name',
                    'branch:id,name,code',
                    'uniformStock.uniformType:id,description',
                    'uniformStock.size:id,description',
                    'uniformStock.uniformStatus:id,description',
                ]);

                return response()->json($invoice, 201);

            } catch (\Exception $e) {
                DB::rollBack();
                
                Log::error('Error en transacción de Invoice:', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                
                // Eliminar archivo si se subió y hay error
                if ($invoiceFilePath && Storage::disk('private')->exists($invoiceFilePath)) {
                    Storage::disk('private')->delete($invoiceFilePath);
                }
                
                throw $e;
            }

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error general en Invoice store:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error al crear la factura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/invoices/{id}
     */
    public function show(string $id): JsonResponse
    {
        try {
            $invoice = Invoice::with([
                'supplier:id,legal_name,rfc,email,phone',
                'businessLine:id,name',
                'federalEntity:id,name',
                'branch:id,name,code,address,phone',
                'uniformStock.uniformType:id,description',
                'uniformStock.uniformType.bodyPart:id,description',
                'uniformStock.uniformType.sexe:id,name',
                'uniformStock.uniformType.color:id,description',
                'uniformStock.size:id,description',
                'uniformStock.uniformStatus:id,description',
            ])
            ->findOrFail($id);
            
            return response()->json($invoice, 200);
        } catch (\Exception $e) {
            Log::error('Error en Invoice show:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Factura no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * ✅ NUEVO: Actualizar solo los checkboxes de pago
     * PATCH /api/invoices/{id}/update-payment-status
     */
    public function updatePaymentStatus(Request $request, string $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);

            $validated = $request->validate([
                'merchandise_paid' => 'nullable|boolean',
                'invoice_paid' => 'nullable|boolean',
            ]);

            // ✅ LÓGICA: Solo se puede cambiar de false a true, NO de true a false
            $updates = [];

            if (isset($validated['merchandise_paid'])) {
                // Solo permitir cambio si actualmente es false y se quiere poner true
                if (!$invoice->merchandise_paid && $validated['merchandise_paid']) {
                    $updates['merchandise_paid'] = true;
                }
            }

            if (isset($validated['invoice_paid'])) {
                // Solo permitir cambio si actualmente es false y se quiere poner true
                if (!$invoice->invoice_paid && $validated['invoice_paid']) {
                    $updates['invoice_paid'] = true;
                }
            }

            // Actualizar solo si hay cambios
            if (!empty($updates)) {
                $invoice->update($updates);
                
                Log::info('Estados de pago actualizados:', [
                    'invoice_id' => $id,
                    'updates' => $updates
                ]);
            }

            return response()->json([
                'message' => 'Estados actualizados exitosamente',
                'invoice' => $invoice
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al actualizar estados de pago:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al actualizar los estados',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     * PUT/PATCH /api/invoices/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);

            $merchandisePaid = $this->convertToBoolean($request->input('merchandise_paid', $invoice->merchandise_paid));
            $invoicePaid = $this->convertToBoolean($request->input('invoice_paid', $invoice->invoice_paid));

            $validated = $request->validate([
                'invoice_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            ]);

            $validated['merchandise_paid'] = $merchandisePaid;
            $validated['invoice_paid'] = $invoicePaid;

            if ($request->hasFile('invoice_file')) {
                if ($invoice->invoice_file && Storage::disk('private')->exists($invoice->invoice_file)) {
                    Storage::disk('private')->delete($invoice->invoice_file);
                }
                
                $file = $request->file('invoice_file');
                $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
                $validated['invoice_file'] = $file->storeAs('invoices', $filename, 'private');
            }

            $invoice->update($validated);
            
            $invoice->load([
                'supplier:id,legal_name,rfc',
                'businessLine:id,name',
                'federalEntity:id,name',
                'branch:id,name,code',
            ]);

            return response()->json($invoice, 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en Invoice update:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al actualizar la factura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/invoices/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);
            
            if ($invoice->invoice_file && Storage::disk('private')->exists($invoice->invoice_file)) {
                Storage::disk('private')->delete($invoice->invoice_file);
            }
            
            $invoice->delete();

            return response()->json([
                'message' => 'Factura eliminada exitosamente'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error en Invoice destroy:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al eliminar la factura',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Subir archivo de factura después de crear
     * POST /api/invoices/{id}/upload-file
     */
    public function uploadFile(Request $request, string $id): JsonResponse
    {
        try {
            $invoice = Invoice::findOrFail($id);

            $validated = $request->validate([
                'invoice_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
            ], [
                'invoice_file.required' => 'Debe seleccionar un archivo',
                'invoice_file.mimes' => 'El archivo debe ser PDF, JPG, JPEG o PNG',
                'invoice_file.max' => 'El archivo no puede exceder 10MB',
            ]);

            if ($invoice->invoice_file && Storage::disk('private')->exists($invoice->invoice_file)) {
                Storage::disk('private')->delete($invoice->invoice_file);
            }

            $file = $request->file('invoice_file');
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('invoices', $filename, 'private');

            $invoice->update(['invoice_file' => $filePath]);

            return response()->json([
                'message' => 'Archivo subido exitosamente',
                'invoice_file' => $filePath
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al subir archivo de factura:', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al subir el archivo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get sizes filtered by uniform type
     * GET /api/invoices/sizes-by-uniform/{uniformTypeId}
     */
    public function getSizesByUniformType(string $uniformTypeId): JsonResponse
    {
        try {
            $uniformType = \App\Models\UniformType::with([
                'bodyPart:id,description',
                'sexe:id,name'
            ])->findOrFail($uniformTypeId);

            $sizes = \App\Models\Size::where('body_part_id', $uniformType->body_part_id)
                                    ->where('sexe_id', $uniformType->sexe_id)
                                    ->where('status', true)
                                    ->orderBy('description', 'asc')
                                    ->get(['id', 'description']);

            return response()->json($sizes, 200);
        } catch (\Exception $e) {
            Log::error('Error al obtener tallas por tipo de uniforme:', [
                'uniform_type_id' => $uniformTypeId,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Error al obtener las tallas',
                'error' => $e->getMessage()
            ], 500);
        }
    }



/**
 * Obtener opciones agrupadas por talla+color con precio máximo
 */
/**
 * Obtener opciones agrupadas por talla+color con precio máximo
 * GET /api/invoices/uniform-options/{uniformTypeId}
 */
public function getUniformOptions(int $uniformTypeId): JsonResponse
{
    try {
        Log::info('🔍 Solicitando opciones para uniform_type_id:', ['uniform_type_id' => $uniformTypeId]);
        
        // Obtener todos los registros de stock disponibles
        $uniformStocks = UniformStock::with(['size:id,description', 'color:id,description'])
            ->where('uniform_type_id', $uniformTypeId)
            ->where('uniform_status_id', 1) // Solo uniformes disponibles
            ->get();

        Log::info('📦 Total de registros encontrados:', ['count' => $uniformStocks->count()]);

        if ($uniformStocks->isEmpty()) {
            Log::info('⚠️ No se encontraron uniformes disponibles');
            return response()->json([], 200);
        }

        // Agrupar por combinación de size_id + color_id
        $options = $uniformStocks->groupBy(function($item) {
            return $item->size_id . '-' . $item->color_id;
        })->map(function($group) {
            // Obtener el item con precio máximo de cada grupo
            $maxPriceItem = $group->sortByDesc('unit_price')->first();
            
            Log::info('✅ Opción generada:', [
                'size' => $maxPriceItem->size->description ?? 'N/A',
                'color' => $maxPriceItem->color->description ?? 'N/A',
                'price' => $maxPriceItem->unit_price,
                'group_count' => $group->count()
            ]);
            
            return [
                'uniform_stock_id' => $maxPriceItem->id,
                'size_id' => $maxPriceItem->size_id,
                'size_description' => $maxPriceItem->size->description ?? 'N/A',
                'color_id' => $maxPriceItem->color_id,
                'color_description' => $maxPriceItem->color->description ?? 'N/A',
                'unit_price' => (float)$maxPriceItem->unit_price,
                'available_quantity' => $group->count(),
                'option_label' => sprintf('Talla: %s | Color: %s - $%.2f',
                    $maxPriceItem->size->description ?? 'N/A',
                    $maxPriceItem->color->description ?? 'N/A',
                    (float)$maxPriceItem->unit_price
                )
            ];
        })->values(); // Reindexar array numéricamente

        Log::info('🎯 Total de opciones únicas:', ['count' => $options->count()]);

        return response()->json($options, 200);
        
    } catch (\Exception $e) {
        Log::error('❌ Error al obtener opciones:', [
            'uniform_type_id' => $uniformTypeId,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'message' => 'Error al obtener las opciones de uniformes',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Convertir valor a booleano
     */
    private function convertToBoolean($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        
        if (is_numeric($value)) {
            return (int)$value === 1;
        }
        
        if (is_string($value)) {
            $normalized = strtolower(trim($value));
            return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
        }
        
        return false;
    }

    /**
     * Generar código único para cada uniforme
     */
    private function generateUniqueCode(int $uniformTypeId, int $sizeId, int $colorId, int $index): string
{
    $timestamp = time();
    $indexFormatted = str_pad($index, 3, '0', STR_PAD_LEFT);
    
    return "UT{$uniformTypeId}-S{$sizeId}-C{$colorId}-{$timestamp}-{$indexFormatted}";
}

/**
 * Obtener color del tipo de uniforme específico
 * GET /api/invoices/colors-by-uniform/{uniformTypeId}
 */
public function getColorsByUniformType(int $uniformTypeId): JsonResponse
{
    try {
        // Obtener el uniform_type para saber qué color tiene asignado
        $uniformType = \App\Models\UniformType::findOrFail($uniformTypeId);
        
        // Retornar el color asociado a este tipo de uniforme
        $color = \App\Models\Color::where('id', $uniformType->color_id)
                                  ->first(['id', 'description']);

        if (!$color) {
            return response()->json([], 200);
        }

        // Retornar como array para mantener consistencia con el frontend
        return response()->json([$color], 200);
    } catch (\Exception $e) {
        Log::error('Error al obtener color por tipo de uniforme:', [
            'uniform_type_id' => $uniformTypeId,
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'message' => 'Error al obtener el color',
            'error' => $e->getMessage()
        ], 500);
    }
}
}