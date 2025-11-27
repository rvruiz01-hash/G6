<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{
    ShiftType, HolidayDay, Day31Charge, Seniority, Uma, Salary,
    ImssConcept, WorkRiskPremium, MonthlyIsr, EntityPercentage, UniformStock, 
    BusinessLine, FederalEntity, Quotation
};
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class QuoterController extends Controller
{
    public function calculate(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'business_line_id' => 'required|exists:business_lines,id',
                'shift_type_id' => 'required|exists:shift_types,id',
                'federal_entity_id' => 'required|exists:federal_entities,id',
                'net_salary' => 'required|numeric|min:0',
                'total_elements' => 'required|integer|min:1',
                'total_rest_days' => 'required|integer|min:0',
                'has_holidays' => 'boolean',
                'has_day_31' => 'boolean',
                'uniforms' => 'required|array|min:1',
                'uniforms.*.uniform_stock_id' => 'required|exists:uniform_stock,id',
                'uniforms.*.quantity' => 'required|integer|min:1',
            ]);

            Log::info('═══════════════════════════════════════════════════════════════');
            Log::info('🎯 INICIO DE CÁLCULO DE COTIZACIÓN');
            Log::info('═══════════════════════════════════════════════════════════════');
            
            // Constantes
            $DAYS_MONTH = 30;
            $DAYS_TWO_MONTHS = 60;
            $DAYS_YEAR = 365;
            $MONTHS_YEAR = 12;
            $UTILITY_PERCENTAGE = 15;
            $ADMIN_EXPENSES_PERCENTAGE = 10;
            $TIIE = 0.15;

            $netSalary = floatval($validated['net_salary']);
            $totalElements = intval($validated['total_elements']);
            $totalRestDays = intval($validated['total_rest_days']);

            Log::info('📥 DATOS DE ENTRADA:', [
                'business_line_id' => $validated['business_line_id'],
                'shift_type_id' => $validated['shift_type_id'],
                'federal_entity_id' => $validated['federal_entity_id'],
                'net_salary' => $netSalary,
                'total_elements' => $totalElements,
                'total_rest_days' => $totalRestDays,
                'has_holidays' => $validated['has_holidays'] ?? false,
                'has_day_31' => $validated['has_day_31'] ?? false,
            ]);

            // ═══════════════════════════════════════════════════════════════
            // 1. SUELDO MENSUAL
            // ═══════════════════════════════════════════════════════════════
            Log::info('');
            Log::info('🔹 PASO 1: CÁLCULO DEL SUELDO MENSUAL');
            Log::info('─────────────────────────────────────');
            
            $dailyRate = $netSalary / $DAYS_MONTH;
            Log::info("   Cuota Diaria = Sueldo Neto / 30");
            Log::info("   Cuota Diaria = {$netSalary} / {$DAYS_MONTH} = " . number_format($dailyRate, 2));
            
            $restDaysPay = $dailyRate * $totalRestDays;
            Log::info("   Descansos = Cuota Diaria × Total Descansos");
            Log::info("   Descansos = " . number_format($dailyRate, 2) . " × {$totalRestDays} = " . number_format($restDaysPay, 2));

            // Festivos
            $holidayPay = 0;
            if ($validated['has_holidays'] ?? false) {
                $totalHolidays = HolidayDay::count() * 2;
                $holidayPercentage = $totalHolidays / $MONTHS_YEAR;
                $holidayPay = $dailyRate * $holidayPercentage;
                
                Log::info("   ✅ Días Festivos ACTIVADO");
                Log::info("   Total Festivos = " . HolidayDay::count() . " × 2 = {$totalHolidays}");
                Log::info("   Porcentaje Festivo = {$totalHolidays} / {$MONTHS_YEAR} = " . number_format($holidayPercentage, 3));
                Log::info("   Festivo = " . number_format($dailyRate, 2) . " × " . number_format($holidayPercentage, 3) . " = " . number_format($holidayPay, 2));
            } else {
                Log::info("   ❌ Días Festivos NO activado = $0.00");
            }

            // Día 31
            $day31Pay = 0;
            if ($validated['has_day_31'] ?? false) {
                $day31Charge = Day31Charge::orderBy('effective_date', 'desc')->first();
                if ($day31Charge) {
                    $initialPercentage = floatval($day31Charge->percentage);
                    $day31Percentage = (($DAYS_YEAR / $MONTHS_YEAR) - $DAYS_MONTH) + $initialPercentage;
                    $day31Pay = $dailyRate * $day31Percentage;
                    
                    Log::info("   ✅ Día 31 ACTIVADO");
                    Log::info("   Porcentaje Inicial = {$initialPercentage}");
                    Log::info("   Porcentaje Día 31 = (({$DAYS_YEAR}/{$MONTHS_YEAR}) - {$DAYS_MONTH}) + {$initialPercentage} = " . number_format($day31Percentage, 2));
                    Log::info("   Día 31 = " . number_format($dailyRate, 2) . " × " . number_format($day31Percentage, 2) . " = " . number_format($day31Pay, 2));
                }
            } else {
                Log::info("   ❌ Día 31 NO activado = $0.00");
            }

            $monthlySalary = $netSalary + $restDaysPay + $holidayPay + $day31Pay;
            
            Log::info('');
            Log::info('   ➡️  SUELDO MENSUAL TOTAL:');
            Log::info("      Sueldo Neto........ $" . number_format($netSalary, 2));
            Log::info("      + Descansos........ $" . number_format($restDaysPay, 2));
            Log::info("      + Festivos......... $" . number_format($holidayPay, 2));
            Log::info("      + Día 31........... $" . number_format($day31Pay, 2));
            Log::info("      ─────────────────────────────────");
            Log::info("      = TOTAL............. $" . number_format($monthlySalary, 2));

            // ═══════════════════════════════════════════════════════════════
            // 2. PRESTACIONES
            // ═══════════════════════════════════════════════════════════════
            Log::info('');
            Log::info('🔹 PASO 2: CÁLCULO DE PRESTACIONES');
            Log::info('─────────────────────────────────────');
            
            $seniority = Seniority::where('years', 1)->first();
            if (!$seniority) {
                return response()->json(['message' => 'No se encontró información de antigüedad'], 404);
            }

            $vacationDays = $seniority->vacation_days;
            $christmasBonusDays = $seniority->christmas_bonus_days;
            $vacationPremiumInitial = $seniority->vacation_premium_percentage;
            
            Log::info("   Datos de Antigüedad (año 1):");
            Log::info("   - Días Vacaciones: {$vacationDays}");
            Log::info("   - Días Aguinaldo: {$christmasBonusDays}");
            Log::info("   - Prima Vacacional: {$vacationPremiumInitial}%");
            
            // Vacaciones
            $vacationPercentage = ($vacationDays / $DAYS_YEAR) * 100;
            $vacations = ($vacationPercentage * $monthlySalary) / 100;
            
            Log::info('');
            Log::info("   📌 VACACIONES:");
            Log::info("      Porcentaje = ({$vacationDays} / {$DAYS_YEAR}) × 100 = " . number_format($vacationPercentage, 2) . "%");
            Log::info("      Vacaciones = (" . number_format($vacationPercentage, 2) . " × " . number_format($monthlySalary, 2) . ") / 100");
            Log::info("      Vacaciones = $" . number_format($vacations, 2));

            // Prima Vacacional
            $vacationPremiumPercentage = ($vacationPercentage * $vacationPremiumInitial) / 100;
            $vacationPremium = ($vacationPremiumPercentage * $monthlySalary) / 100;
            
            Log::info('');
            Log::info("   📌 PRIMA VACACIONAL:");
            Log::info("      Porcentaje = (" . number_format($vacationPercentage, 2) . " × {$vacationPremiumInitial}) / 100 = " . number_format($vacationPremiumPercentage, 2) . "%");
            Log::info("      Prima Vac. = (" . number_format($vacationPremiumPercentage, 2) . " × " . number_format($monthlySalary, 2) . ") / 100");
            Log::info("      Prima Vac. = $" . number_format($vacationPremium, 2));

            // Aguinaldo
            $christmasBonusPercentage = ($christmasBonusDays / $DAYS_YEAR) * 100;
            $christmasBonus = ($christmasBonusPercentage * $monthlySalary) / 100;
            
            Log::info('');
            Log::info("   📌 AGUINALDO:");
            Log::info("      Porcentaje = ({$christmasBonusDays} / {$DAYS_YEAR}) × 100 = " . number_format($christmasBonusPercentage, 2) . "%");
            Log::info("      Aguinaldo = (" . number_format($christmasBonusPercentage, 2) . " × " . number_format($monthlySalary, 2) . ") / 100");
            Log::info("      Aguinaldo = $" . number_format($christmasBonus, 2));

            // Prima de Antigüedad
            $seniorityPercentage = ($vacationDays / $DAYS_YEAR) * 100;
            $seniorityPay = ($seniorityPercentage * $monthlySalary) / 100;
            
            Log::info('');
            Log::info("   📌 PRIMA DE ANTIGÜEDAD:");
            Log::info("      Porcentaje = ({$vacationDays} / {$DAYS_YEAR}) × 100 = " . number_format($seniorityPercentage, 2) . "%");
            Log::info("      Prima Ant. = (" . number_format($seniorityPercentage, 2) . " × " . number_format($monthlySalary, 2) . ") / 100");
            Log::info("      Prima Ant. = $" . number_format($seniorityPay, 2));

            $totalBenefits = $vacations + $vacationPremium + $christmasBonus + $seniorityPay;
            
            Log::info('');
            Log::info('   ➡️  PRESTACIONES TOTALES:');
            Log::info("      Vacaciones............ $" . number_format($vacations, 2));
            Log::info("      + Prima Vacacional.... $" . number_format($vacationPremium, 2));
            Log::info("      + Aguinaldo........... $" . number_format($christmasBonus, 2));
            Log::info("      + Prima Antigüedad.... $" . number_format($seniorityPay, 2));
            Log::info("      ─────────────────────────────────");
            Log::info("      = TOTAL............... $" . number_format($totalBenefits, 2));

            // ═══════════════════════════════════════════════════════════════
            // 3. IMSS (CARGA SOCIAL)
            // ═══════════════════════════════════════════════════════════════
            Log::info('');
            Log::info('🔹 PASO 3: CÁLCULO DEL IMSS');
            Log::info('─────────────────────────────────────');
            
            $currentYear = date('Y');
            $uma = Uma::where('year', $currentYear)->first();
            $salary = Salary::whereYear('effective_date', $currentYear)->first();
            $workRiskPremium = WorkRiskPremium::where('year', $currentYear)->first();

            if (!$uma || !$salary || !$workRiskPremium) {
                return response()->json(['message' => 'Faltan datos de UMA, Salario o Prima de Riesgo'], 404);
            }

            $umaValue = floatval($uma->daily);
            $dailySalary = floatval($salary->area_a);
            $riskPremiumValue = floatval($workRiskPremium->amount);
            
            Log::info("   Valores Base:");
            Log::info("   - UMA Diario: $" . number_format($umaValue, 2));
            Log::info("   - Salario Diario (Área A): $" . number_format($dailySalary, 2));
            Log::info("   - Prima de Riesgo: " . number_format($riskPremiumValue, 4) . "%");

            $aguinaldoFactor = $christmasBonusDays / $DAYS_YEAR;
            $vacationPremiumFactor = 3;
            $integrationFactor = 1 + ($vacationPremiumFactor / $DAYS_YEAR) + $aguinaldoFactor;
            $sdi = round($integrationFactor * $dailySalary, 2);
            $daysImss = 1;
            
            Log::info('');
            Log::info("   📊 CÁLCULO DEL SDI (Salario Diario Integrado):");
            Log::info("      Aguinaldo Factor = {$christmasBonusDays} / {$DAYS_YEAR} = " . number_format($aguinaldoFactor, 4));
            Log::info("      Factor Integración = 1 + ({$vacationPremiumFactor} / {$DAYS_YEAR}) + " . number_format($aguinaldoFactor, 4));
            Log::info("      Factor Integración = " . number_format($integrationFactor, 4));
            Log::info("      SDI = " . number_format($integrationFactor, 4) . " × " . number_format($dailySalary, 2) . " = $" . number_format($sdi, 2));

            $imssConcepts = ImssConcept::where('id', '>', 1)->get();
            
            Log::info('');
            Log::info("   💼 CONCEPTOS IMSS (PATRÓN):");

            // Cuota Fija (ID 2)
            $cfPercentage = floatval(rtrim($imssConcepts[0]->employer_percentage, '%'));
            $fixedFee = round((($umaValue * $daysImss * $cfPercentage) / 100), 2);
            Log::info("      1. Cuota Fija ({$cfPercentage}%):");
            Log::info("         (" . number_format($umaValue, 2) . " × {$daysImss} × {$cfPercentage}) / 100 = $" . number_format($fixedFee, 2));

            $excessEmployer = 0.00;
            Log::info("      2. Excedente 3 UMAs: $0.00 (salario < 3 UMAs)");
            
            // Prestaciones en Dinero (ID 4)
            $prestDinPatronPct = floatval(rtrim($imssConcepts[2]->employer_percentage, '%'));
            $dineroPatron = round((($prestDinPatronPct * $sdi * $daysImss) / 100), 2);
            Log::info("      3. Prest. en Dinero ({$prestDinPatronPct}%):");
            Log::info("         (" . number_format($prestDinPatronPct, 4) . " × " . number_format($sdi, 2) . " × {$daysImss}) / 100 = $" . number_format($dineroPatron, 2));

            // Gastos Médicos Pensionados (ID 5)
            $gastosMedicosPct = floatval(rtrim($imssConcepts[3]->employer_percentage, '%'));
            $gastosMedicosPatron = round((($gastosMedicosPct * $sdi * $daysImss) / 100), 2);
            Log::info("      4. Gastos Médicos ({$gastosMedicosPct}%):");
            Log::info("         (" . number_format($gastosMedicosPct, 4) . " × " . number_format($sdi, 2) . " × {$daysImss}) / 100 = $" . number_format($gastosMedicosPatron, 2));

            // Invalidez y Vida (ID 6)
            $invalidezVidaPct = floatval(rtrim($imssConcepts[4]->employer_percentage, '%'));
            $invalidezVidaPatron = round((($invalidezVidaPct * $sdi * $daysImss) / 100), 2);
            Log::info("      5. Invalidez y Vida ({$invalidezVidaPct}%):");
            Log::info("         (" . number_format($invalidezVidaPct, 4) . " × " . number_format($sdi, 2) . " × {$daysImss}) / 100 = $" . number_format($invalidezVidaPatron, 2));

            // Retiro (ID 7)
            $retiroPct = floatval(rtrim($imssConcepts[5]->employer_percentage, '%'));
            $retiro = round((($retiroPct * $sdi * $daysImss) / 100), 2);
            Log::info("      6. Retiro ({$retiroPct}%):");
            Log::info("         (" . number_format($retiroPct, 4) . " × " . number_format($sdi, 2) . " × {$daysImss}) / 100 = $" . number_format($retiro, 2));

            // Cesantía y Vejez (ID 8)
            $cesantiaVejezPct = floatval(rtrim($imssConcepts[6]->employer_percentage, '%'));
            $cesantiaVejez = round((($cesantiaVejezPct * $sdi * $daysImss) / 100), 2);
            Log::info("      7. Cesantía Vejez Patrón ({$cesantiaVejezPct}%):");
            Log::info("         (" . number_format($cesantiaVejezPct, 4) . " × " . number_format($sdi, 2) . " × {$daysImss}) / 100 = $" . number_format($cesantiaVejez, 2));

            // Guarderías (ID 9)
            $guarderiasPct = floatval(rtrim($imssConcepts[7]->employer_percentage, '%'));
            $guarderias = round((($guarderiasPct * $sdi * $daysImss) / 100), 2);
            Log::info("      8. Guarderías ({$guarderiasPct}%):");
            Log::info("         (" . number_format($guarderiasPct, 4) . " × " . number_format($sdi, 2) . " × {$daysImss}) / 100 = $" . number_format($guarderias, 2));

            // Infonavit (ID 10)
            $infonavitPct = floatval(rtrim($imssConcepts[8]->employer_percentage, '%'));
            $infonavit = round((($infonavitPct * $sdi * $daysImss) / 100), 2);
            Log::info("      9. Infonavit ({$infonavitPct}%):");
            Log::info("         (" . number_format($infonavitPct, 4) . " × " . number_format($sdi, 2) . " × {$daysImss}) / 100 = $" . number_format($infonavit, 2));

            // Riesgo de Trabajo
            $riskPremiumCost = round((($riskPremiumValue * $sdi * $daysImss) / 100), 2);
            Log::info("      10. Riesgo Trabajo (" . number_format($riskPremiumValue, 4) . "%):");
            Log::info("         (" . number_format($riskPremiumValue, 4) . " × " . number_format($sdi, 2) . " × {$daysImss}) / 100 = $" . number_format($riskPremiumCost, 2));

            $totalImssEmployer = $fixedFee + $excessEmployer + $dineroPatron + $gastosMedicosPatron + 
                                $invalidezVidaPatron + $retiro + $cesantiaVejez + $guarderias + 
                                $infonavit + $riskPremiumCost;

            Log::info('');
            Log::info("   📊 TOTAL IMSS DIARIO (Patrón): $" . number_format($totalImssEmployer, 2));
            
            // ✅ CORRECCIÓN: No multiplicar por 30, según el PHP original
            $monthlyImss = $totalImssEmployer * $DAYS_MONTH;
            $totalSocialCharge = $monthlyImss;
            
            Log::info("   📊 TOTAL IMSS MENSUAL: $" . number_format($totalImssEmployer, 2) . " × {$DAYS_MONTH} = $" . number_format($monthlyImss, 2));

            // ═══════════════════════════════════════════════════════════════
            // 4. IMPUESTO ESTATAL
            // ═══════════════════════════════════════════════════════════════
            Log::info('');
            Log::info('🔹 PASO 4: CÁLCULO DEL IMPUESTO ESTATAL');
            Log::info('─────────────────────────────────────');
            
            $isrBracket = MonthlyIsr::where('lower_limit', '<=', $monthlySalary)
                                    ->where('upper_limit', '>=', $monthlySalary)
                                    ->first();

            $isr = 0;
            if ($isrBracket) {
                $excess = $monthlySalary - $isrBracket->lower_limit;
                $excessPercentage = floatval($isrBracket->excess_percentage);
                
                // ✅ CORRECCIÓN: NO multiplicar por 12 meses
                $isrCalculated = ($excess * $excessPercentage / 100) + floatval($isrBracket->fixed_fee);
                $isr = round($isrCalculated, 0);  // ← SIN MULTIPLICAR POR 12
                
                Log::info("   📌 ISR MENSUAL:");
                Log::info("      Sueldo Mensual: $" . number_format($monthlySalary, 2));
                Log::info("      Límite Inferior: $" . number_format($isrBracket->lower_limit, 2));
                Log::info("      Excedente: $" . number_format($excess, 2));
                Log::info("      % sobre Excedente: " . number_format($excessPercentage, 2) . "%");
                Log::info("      Cuota Fija: $" . number_format($isrBracket->fixed_fee, 2));
                Log::info("      ISR = ((" . number_format($excess, 2) . " × " . number_format($excessPercentage, 2) . ") / 100) + " . number_format($isrBracket->fixed_fee, 2));
                Log::info("      ISR = $" . number_format($isr, 2));
            } else {
                Log::info("   ⚠️  No se encontró rango de ISR para sueldo $" . number_format($monthlySalary, 2));
            }

            $entityPercentage = EntityPercentage::where('federal_entity_id', $validated['federal_entity_id'])
                                               ->where('business_line_id', $validated['business_line_id'])
                                               ->first();

            $entityTax = $entityPercentage ? floatval($entityPercentage->percentage) : 0;
            $stateTax = $entityTax + $isr;
            
            Log::info('');
            Log::info("   📌 IMPUESTO ENTIDAD:");
            Log::info("      Porcentaje Entidad: " . number_format($entityTax, 2) . "%");
            Log::info("      Impuesto Entidad: $" . number_format($entityTax, 2));
            
            Log::info('');
            Log::info('   ➡️  IMPUESTO ESTATAL TOTAL:');
            Log::info("      ISR................. $" . number_format($isr, 2));
            Log::info("      + Impuesto Entidad.. $" . number_format($entityTax, 2));
            Log::info("      ─────────────────────────────────");
            Log::info("      = TOTAL............. $" . number_format($stateTax, 2));

            // ═══════════════════════════════════════════════════════════════
            // 5. COSTO TOTAL POR GUARDIA
            // ═══════════════════════════════════════════════════════════════
            Log::info('');
            Log::info('🔹 PASO 5: COSTO TOTAL POR GUARDIA');
            Log::info('─────────────────────────────────────');
            
            $directCost = $monthlySalary + $totalBenefits + $totalSocialCharge + $stateTax;
            $adminExpenses = ($ADMIN_EXPENSES_PERCENTAGE * $monthlySalary) / 100;
            $totalCostPerGuard = $directCost + $adminExpenses;
            
            Log::info("   Costo Directo:");
            Log::info("      Sueldo Mensual........ $" . number_format($monthlySalary, 2));
            Log::info("      + Prestaciones........ $" . number_format($totalBenefits, 2));
            Log::info("      + Carga Social........ $" . number_format($totalSocialCharge, 2));
            Log::info("      + Impuesto Estatal.... $" . number_format($stateTax, 2));
            Log::info("      ─────────────────────────────────");
            Log::info("      = Costo Directo....... $" . number_format($directCost, 2));
            
            Log::info('');
            Log::info("   Gastos Administrativos ({$ADMIN_EXPENSES_PERCENTAGE}%):");
            Log::info("      (" . number_format($ADMIN_EXPENSES_PERCENTAGE, 0) . " × " . number_format($monthlySalary, 2) . ") / 100 = $" . number_format($adminExpenses, 2));
            
            Log::info('');
            Log::info('   ➡️  COSTO TOTAL POR GUARDIA:');
            Log::info("      Costo Directo......... $" . number_format($directCost, 2));
            Log::info("      + Gastos Admin........ $" . number_format($adminExpenses, 2));
            Log::info("      ─────────────────────────────────");
            Log::info("      = TOTAL............... $" . number_format($totalCostPerGuard, 2));

            // ═══════════════════════════════════════════════════════════════
            // 6. COSTO UNIFORME
            // ═══════════════════════════════════════════════════════════════
            Log::info('');
            Log::info('🔹 PASO 6: COSTO DE UNIFORMES');
            Log::info('─────────────────────────────────────');
            
            $uniformCost = 0;
            $uniformsDetails = [];
            
            foreach ($validated['uniforms'] as $index => $uniform) {
                $uniformStock = UniformStock::with(['uniformType', 'size', 'color', 'invoice'])
                    ->find($uniform['uniform_stock_id']);
                
                if ($uniformStock && $uniformStock->invoice) {
                    // Obtener el precio MÁS ALTO para esta combinación
                    $maxPrice = UniformStock::where('uniform_type_id', $uniformStock->uniform_type_id)
                        ->where('size_id', $uniformStock->size_id)
                        ->where('color_id', $uniformStock->color_id)
                        ->whereHas('invoice', function ($query) use ($validated) {
                            $query->where('business_line_id', $validated['business_line_id']);
                        })
                        ->max('unit_price');
                    
                    $maxPrice = floatval($maxPrice);
                    $quantity = intval($uniform['quantity']);
                    $subtotal = $maxPrice * $quantity;
                    $monthlyCost = $subtotal / $MONTHS_YEAR;
                    
                    Log::info("   Uniforme #" . ($index + 1) . ":");
                    Log::info("      Tipo: " . ($uniformStock->uniformType->description ?? 'N/A'));
                    Log::info("      Talla: " . ($uniformStock->size->description ?? 'N/A'));
                    Log::info("      Color: " . ($uniformStock->color->description ?? 'N/A'));
                    Log::info("      Cantidad: {$quantity}");
                    Log::info("      Precio Máx: $" . number_format($maxPrice, 2));
                    Log::info("      Subtotal: $" . number_format($subtotal, 2));
                    Log::info("      Costo Mensual: $" . number_format($subtotal, 2) . " / {$MONTHS_YEAR} = $" . number_format($monthlyCost, 2));
                    
                    $uniformsDetails[] = [
                        'uniform_stock_id' => $uniformStock->id,
                        'uniform_type' => $uniformStock->uniformType->description ?? 'N/A',
                        'size' => $uniformStock->size->description ?? 'N/A',
                        'color' => $uniformStock->color->description ?? 'N/A',
                        'quantity' => $quantity,
                        'max_unit_price' => $maxPrice,
                        'subtotal' => $subtotal,
                    ];
                    
                    $uniformCost += $monthlyCost;
                }
            }
            
            Log::info('');
            Log::info('   ➡️  COSTO MENSUAL DE UNIFORMES: $' . number_format($uniformCost, 2));

            // ═══════════════════════════════════════════════════════════════
            // 7. COSTO VENTA Y PRECIO FINAL
            // ═══════════════════════════════════════════════════════════════
            Log::info('');
            Log::info('🔹 PASO 7: PRECIO DE VENTA FINAL');
            Log::info('─────────────────────────────────────');
            
            $saleCostWithoutFinancing = $uniformCost + $totalCostPerGuard;
            $financingPercentage = $saleCostWithoutFinancing * $TIIE;
            $financing = ($financingPercentage / $DAYS_YEAR) * $DAYS_TWO_MONTHS;
            $totalSaleCost = $saleCostWithoutFinancing + $financing;
            $utility = ($saleCostWithoutFinancing * $UTILITY_PERCENTAGE) / 100;
            $salePrice = $totalSaleCost + $utility;
            
            Log::info("   Costo Venta sin Financiamiento:");
            Log::info("      Uniforme.............. $" . number_format($uniformCost, 2));
            Log::info("      + Costo por Guardia... $" . number_format($totalCostPerGuard, 2));
            Log::info("      ─────────────────────────────────");
            Log::info("      = Subtotal............ $" . number_format($saleCostWithoutFinancing, 2));
            
            Log::info('');
            Log::info("   Financiamiento (TIIE {$TIIE}):");
            Log::info("      % Financiamiento = " . number_format($saleCostWithoutFinancing, 2) . " × {$TIIE} = $" . number_format($financingPercentage, 2));
            Log::info("      Financiamiento = ($" . number_format($financingPercentage, 2) . " / {$DAYS_YEAR}) × {$DAYS_TWO_MONTHS} = $" . number_format($financing, 2));
            
            Log::info('');
            Log::info("   Costo Venta Total:");
            Log::info("      Costo sin Fin......... $" . number_format($saleCostWithoutFinancing, 2));
            Log::info("      + Financiamiento...... $" . number_format($financing, 2));
            Log::info("      ─────────────────────────────────");
            Log::info("      = Total............... $" . number_format($totalSaleCost, 2));
            
            Log::info('');
            Log::info("   Utilidad ({$UTILITY_PERCENTAGE}%):");
            Log::info("      (" . number_format($saleCostWithoutFinancing, 2) . " × {$UTILITY_PERCENTAGE}) / 100 = $" . number_format($utility, 2));
            
            Log::info('');
            Log::info('   ➡️  PRECIO DE VENTA FINAL:');
            Log::info("      Costo Venta Total..... $" . number_format($totalSaleCost, 2));
            Log::info("      + Utilidad............ $" . number_format($utility, 2));
            Log::info("      ═════════════════════════════════");
            Log::info("      = PRECIO VENTA........ $" . number_format($salePrice, 2));

            $breakdown = [
                'rest_days_pay' => round($restDaysPay, 2),
                'holiday_pay' => round($holidayPay, 2),
                'day_31_pay' => round($day31Pay, 2),
                'vacations' => round($vacations, 2),
                'vacation_premium' => round($vacationPremium, 2),
                'christmas_bonus' => round($christmasBonus, 2),
                'seniority_pay' => round($seniorityPay, 2),
                'admin_expenses' => round($adminExpenses, 2),
            ];

            // GUARDAR COTIZACIÓN
            $user = Auth::user();
            $folio = Quotation::generateFolio();
            
            Log::info('');
            Log::info('💾 GUARDANDO COTIZACIÓN EN BD');
            Log::info("   Folio: {$folio}");
            Log::info("   Usuario: {$user->id}");
            
            $quotation = Quotation::create([
                'user_id' => $user->id,
                'folio' => $folio,
                'business_line_id' => $validated['business_line_id'],
                'shift_type_id' => $validated['shift_type_id'],
                'federal_entity_id' => $validated['federal_entity_id'],
                'net_salary' => $netSalary,
                'total_elements' => $totalElements,
                'total_rest_days' => $totalRestDays,
                'has_holidays' => $validated['has_holidays'] ?? false,
                'has_day_31' => $validated['has_day_31'] ?? false,
                'monthly_salary' => round($monthlySalary, 2),
                'total_benefits' => round($totalBenefits, 2),
                'total_social_charge' => round($totalSocialCharge, 2),
                'state_tax' => round($stateTax, 2),
                'total_cost_per_guard' => round($totalCostPerGuard, 2),
                'uniform_cost' => round($uniformCost, 2),
                'sale_cost_without_financing' => round($saleCostWithoutFinancing, 2),
                'financing' => round($financing, 2),
                'utility' => round($utility, 2),
                'sale_price' => round($salePrice, 2),
                'breakdown' => $breakdown,
                'uniforms' => $uniformsDetails,
            ]);

            Log::info('✅ Cotización guardada exitosamente con ID: ' . $quotation->id);
            Log::info('═══════════════════════════════════════════════════════════════');
            Log::info('🎉 FIN DEL CÁLCULO DE COTIZACIÓN');
            Log::info('═══════════════════════════════════════════════════════════════');

            return response()->json([
                'data' => [
                    'quotation_id' => $quotation->id,
                    'folio' => $folio,
                    'monthly_salary' => round($monthlySalary, 2),
                    'total_benefits' => round($totalBenefits, 2),
                    'total_social_charge' => round($totalSocialCharge, 2),
                    'state_tax' => round($stateTax, 2),
                    'total_cost_per_guard' => round($totalCostPerGuard, 2),
                    'uniform_cost' => round($uniformCost, 2),
                    'sale_cost_without_financing' => round($saleCostWithoutFinancing, 2),
                    'financing' => round($financing, 2),
                    'utility' => round($utility, 2),
                    'sale_price' => round($salePrice, 2),
                    'breakdown' => $breakdown,
                    'uniforms_details' => $uniformsDetails,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('❌ ERROR EN CÁLCULO DE COTIZACIÓN:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error al calcular cotización',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function generatePdf(Request $request)
    {
        try {
            $validated = $request->validate([
                'business_line_id' => 'required|exists:business_lines,id',
                'shift_type_id' => 'required|exists:shift_types,id',
                'federal_entity_id' => 'required|exists:federal_entities,id',
                'net_salary' => 'required|numeric|min:0',
                'total_elements' => 'required|integer|min:1',
                'total_rest_days' => 'required|integer|min:0',
                'has_holidays' => 'boolean',
                'has_day_31' => 'boolean',
                'uniforms' => 'required|array|min:1',
                'uniforms.*.uniform_stock_id' => 'required|exists:uniform_stock,id',
                'uniforms.*.quantity' => 'required|integer|min:1',
            ]);

            $calculationResponse = $this->calculate($request);
            $calculationData = json_decode($calculationResponse->getContent(), true);

            if (!isset($calculationData['data'])) {
                return response()->json(['message' => 'Error al calcular cotización'], 500);
            }

            $result = $calculationData['data'];

            $businessLine = BusinessLine::find($validated['business_line_id']);
            $shiftType = ShiftType::find($validated['shift_type_id']);
            $federalEntity = FederalEntity::find($validated['federal_entity_id']);

            $uniformsData = $result['uniforms_details'] ?? [];

            $data = [
                'folio' => $result['folio'],
                'business_line' => $businessLine->description ?? 'N/A',
                'shift_type' => $shiftType->name ?? 'N/A',
                'federal_entity' => $federalEntity->name ?? 'N/A',
                'total_elements' => $validated['total_elements'],
                'total_rest_days' => $validated['total_rest_days'],
                'net_salary' => $validated['net_salary'],
                'has_holidays' => $validated['has_holidays'] ?? false,
                'has_day_31' => $validated['has_day_31'] ?? false,
                'uniforms' => $uniformsData,
            ];

            $pdf = Pdf::loadView('quoter.pdf', [
                'data' => $data,
                'result' => $result
            ]);

            $pdf->setPaper('letter', 'portrait');

            $filename = 'Cotizacion_' . $result['folio'] . '.pdf';

            return $pdf->stream($filename);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}