<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{UniformType, UniformStock, Sex, BodyPart};
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class UniformController extends Controller
{
    /**
     * Obtener sexos disponibles
     */
    public function getSexes(): JsonResponse
    {
        $sexes = Sex::select('id', 'name')->get();
        
        return response()->json([
            'data' => $sexes
        ]);
    }

    /**
     * Obtener partes corporales disponibles
     */
    public function getBodyParts(): JsonResponse
    {
        $bodyParts = BodyPart::select('id', 'description')->get();
        
        return response()->json([
            'data' => $bodyParts
        ]);
    }

    /**
     * Obtener tipos de uniforme filtrados por línea de negocio, sexo y parte corporal
     */
    public function getUniformTypes(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_line_id' => 'required|exists:business_lines,id',
            'sexe_id' => 'required|exists:sexes,id',
            'body_part_id' => 'required|exists:body_parts,id',
        ]);

        $uniformTypes = UniformType::select('id', 'description')
            ->where('business_line_id', $validated['business_line_id'])
            ->where('sexe_id', $validated['sexe_id'])
            ->where('body_part_id', $validated['body_part_id'])
            ->where('status', true)
            ->get();

        return response()->json([
            'data' => $uniformTypes
        ]);
    }

    /**
     * Obtener opciones de uniformes (talla + color) agrupadas
     * Retorna el precio unitario más alto de cada combinación
     */
    public function getUniformOptions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_line_id' => 'required|exists:business_lines,id',
            'sexe_id' => 'required|exists:sexes,id',
            'body_part_id' => 'required|exists:body_parts,id',
            'uniform_type_id' => 'required|exists:uniform_types,id',
        ]);

        // Subconsulta para obtener el precio máximo por combinación
        $maxPrices = DB::table('uniform_stock as us1')
            ->select(
                'us1.uniform_type_id',
                'us1.size_id',
                'us1.color_id',
                DB::raw('MAX(us1.unit_price) as max_price')
            )
            ->join('invoices as i1', 'us1.invoice_id', '=', 'i1.id')
            ->where('i1.business_line_id', $validated['business_line_id'])
            ->where('us1.uniform_type_id', $validated['uniform_type_id'])
            ->groupBy('us1.uniform_type_id', 'us1.size_id', 'us1.color_id');

        // Consulta principal con joins para obtener descripciones
        $uniformOptions = DB::table('uniform_stock as us')
            ->joinSub($maxPrices, 'max_prices', function ($join) {
                $join->on('us.uniform_type_id', '=', 'max_prices.uniform_type_id')
                     ->on('us.size_id', '=', 'max_prices.size_id')
                     ->on('us.color_id', '=', 'max_prices.color_id')
                     ->on('us.unit_price', '=', 'max_prices.max_price');
            })
            ->join('sizes', 'us.size_id', '=', 'sizes.id')
            ->join('colors', 'us.color_id', '=', 'colors.id')
            ->join('uniform_types', 'us.uniform_type_id', '=', 'uniform_types.id')
            ->join('invoices', 'us.invoice_id', '=', 'invoices.id')
            ->where('sizes.sexe_id', $validated['sexe_id'])
            ->where('sizes.body_part_id', $validated['body_part_id'])
            ->where('invoices.business_line_id', $validated['business_line_id'])
            ->where('us.uniform_type_id', $validated['uniform_type_id'])
            ->where('sizes.status', true)
            ->select(
                'us.id as uniform_stock_id',
                'sizes.description as size_description',
                'colors.description as color_description',
                'us.unit_price',
                DB::raw("CONCAT('Talla: ', sizes.description, ' - Color: ', colors.description) as option_label")
            )
            ->distinct()
            ->get();

        return response()->json([
            'data' => $uniformOptions
        ]);
    }

    /**
     * Obtener el precio unitario más alto para un uniform_stock_id específico
     * (por si se necesita validar o recalcular)
     */
    public function getMaxUnitPrice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'uniform_stock_id' => 'required|exists:uniform_stock,id',
        ]);

        $uniformStock = UniformStock::with(['uniformType', 'size', 'color', 'invoice'])
            ->find($validated['uniform_stock_id']);

        if (!$uniformStock) {
            return response()->json([
                'message' => 'Uniform stock not found'
            ], 404);
        }

        // Buscar el precio máximo para esta combinación exacta
        $maxPrice = UniformStock::where('uniform_type_id', $uniformStock->uniform_type_id)
            ->where('size_id', $uniformStock->size_id)
            ->where('color_id', $uniformStock->color_id)
            ->whereHas('invoice', function ($query) use ($uniformStock) {
                $query->where('business_line_id', $uniformStock->invoice->business_line_id);
            })
            ->max('unit_price');

        return response()->json([
            'data' => [
                'uniform_stock_id' => $uniformStock->id,
                'uniform_type' => $uniformStock->uniformType->description ?? 'N/A',
                'size' => $uniformStock->size->description ?? 'N/A',
                'color' => $uniformStock->color->description ?? 'N/A',
                'max_unit_price' => (float) $maxPrice,
                'current_unit_price' => (float) $uniformStock->unit_price,
            ]
        ]);
    }
}