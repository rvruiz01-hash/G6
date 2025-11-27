<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Cotización</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #D97706;
            padding-bottom: 10px;
        }
        .header h1 {
            color: #D97706;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #666;
        }
        .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .section-title {
            background-color: #D97706;
            color: white;
            padding: 8px;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table th {
            background-color: #f3f4f6;
            padding: 8px;
            text-align: left;
            border: 1px solid #ddd;
            font-weight: bold;
        }
        table td {
            padding: 8px;
            border: 1px solid #ddd;
        }
        .total-box {
            background-color: #1e40af;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 5px;
            margin-top: 20px;
        }
        .total-box h2 {
            margin: 0 0 5px 0;
            font-size: 16px;
        }
        .total-box .amount {
            font-size: 32px;
            font-weight: bold;
        }
        .info-grid {
            width: 100%;
            margin-bottom: 15px;
        }
        .info-row {
            display: table;
            width: 100%;
            border-bottom: 1px solid #e5e7eb;
        }
        .info-label {
            display: table-cell;
            width: 40%;
            padding: 8px;
            font-weight: bold;
            background-color: #f9fafb;
        }
        .info-value {
            display: table-cell;
            padding: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        .highlight-row {
            background-color: #fef3c7;
            font-weight: bold;
        }
        .subtotal-row {
            background-color: #f9fafb;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>COTIZACIÓN DE SERVICIO</h1>
        <p>Generado el {{ date('d/m/Y H:i') }}</p>
    </div>

    <!-- Información General -->
    <div class="section">
        <div class="section-title">INFORMACIÓN GENERAL</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Línea de Negocio:</div>
                <div class="info-value">{{ $data['business_line'] ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Tipo de Turno:</div>
                <div class="info-value">{{ $data['shift_type'] ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Entidad Federativa:</div>
                <div class="info-value">{{ $data['federal_entity'] ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Número de Elementos:</div>
                <div class="info-value">{{ $data['total_elements'] ?? 0 }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Sueldo Neto:</div>
                <div class="info-value">${{ number_format($data['net_salary'] ?? 0, 2) }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Total Descansos:</div>
                <div class="info-value">{{ $data['total_rest_days'] ?? 0 }}</div>
            </div>
            @if($data['has_holidays'])
            <div class="info-row">
                <div class="info-label">Incluye Días Festivos:</div>
                <div class="info-value">✓ Sí</div>
            </div>
            @endif
            @if($data['has_day_31'])
            <div class="info-row">
                <div class="info-label">Incluye Día 31:</div>
                <div class="info-value">✓ Sí</div>
            </div>
            @endif
        </div>
    </div>

    <!-- Desglose de Costos -->
    <div class="section">
        <div class="section-title">DESGLOSE DE COSTOS</div>
        <table>
            <thead>
                <tr>
                    <th>Concepto</th>
                    <th style="text-align: right;">Monto</th>
                </tr>
            </thead>
            <tbody>
                <tr class="subtotal-row">
                    <td><strong>Sueldo Mensual</strong></td>
                    <td style="text-align: right;"><strong>${{ number_format($result['monthly_salary'], 2) }}</strong></td>
                </tr>
                <tr>
                    <td>&nbsp;&nbsp;• Sueldo Base</td>
                    <td style="text-align: right;">${{ number_format($data['net_salary'], 2) }}</td>
                </tr>
                <tr>
                    <td>&nbsp;&nbsp;• Descansos</td>
                    <td style="text-align: right;">${{ number_format($result['breakdown']['rest_days_pay'], 2) }}</td>
                </tr>
                @if($result['breakdown']['holiday_pay'] > 0)
                <tr>
                    <td>&nbsp;&nbsp;• Días Festivos</td>
                    <td style="text-align: right;">${{ number_format($result['breakdown']['holiday_pay'], 2) }}</td>
                </tr>
                @endif
                @if($result['breakdown']['day_31_pay'] > 0)
                <tr>
                    <td>&nbsp;&nbsp;• Día 31</td>
                    <td style="text-align: right;">${{ number_format($result['breakdown']['day_31_pay'], 2) }}</td>
                </tr>
                @endif
                
                <tr class="subtotal-row">
                    <td><strong>Prestaciones Totales</strong></td>
                    <td style="text-align: right;"><strong>${{ number_format($result['total_benefits'], 2) }}</strong></td>
                </tr>
                <tr>
                    <td>&nbsp;&nbsp;• Vacaciones</td>
                    <td style="text-align: right;">${{ number_format($result['breakdown']['vacations'], 2) }}</td>
                </tr>
                <tr>
                    <td>&nbsp;&nbsp;• Prima Vacacional</td>
                    <td style="text-align: right;">${{ number_format($result['breakdown']['vacation_premium'], 2) }}</td>
                </tr>
                <tr>
                    <td>&nbsp;&nbsp;• Aguinaldo</td>
                    <td style="text-align: right;">${{ number_format($result['breakdown']['christmas_bonus'], 2) }}</td>
                </tr>
                <tr>
                    <td>&nbsp;&nbsp;• Prima de Antigüedad</td>
                    <td style="text-align: right;">${{ number_format($result['breakdown']['seniority_pay'], 2) }}</td>
                </tr>
                
                <tr class="subtotal-row">
                    <td><strong>Carga Social (IMSS)</strong></td>
                    <td style="text-align: right;"><strong>${{ number_format($result['total_social_charge'], 2) }}</strong></td>
                </tr>
                
                <tr class="subtotal-row">
                    <td><strong>Impuesto Estatal (ISR)</strong></td>
                    <td style="text-align: right;"><strong>${{ number_format($result['state_tax'], 2) }}</strong></td>
                </tr>
                
                <tr class="subtotal-row">
                    <td><strong>Gastos Administrativos (10%)</strong></td>
                    <td style="text-align: right;"><strong>${{ number_format($result['breakdown']['admin_expenses'], 2) }}</strong></td>
                </tr>
                
                <tr class="highlight-row">
                    <td><strong>COSTO TOTAL POR GUARDIA</strong></td>
                    <td style="text-align: right;"><strong>${{ number_format($result['total_cost_per_guard'], 2) }}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Uniformes -->
    @if(!empty($data['uniforms']))
    <div class="section">
        <div class="section-title">UNIFORMES INCLUIDOS</div>
        <table>
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Talla</th>
                    <th>Color</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio Max.</th>
                    <th style="text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($data['uniforms'] as $uniform)
                <tr>
                    <td>{{ $uniform['uniform_type'] ?? 'N/A' }}</td>
                    <td>{{ $uniform['size'] ?? 'N/A' }}</td>
                    <td>{{ $uniform['color'] ?? 'N/A' }}</td>
                    <td style="text-align: center;">{{ $uniform['quantity'] }}</td>
                    <td style="text-align: right;">${{ number_format($uniform['max_unit_price'], 2) }}</td>
                    <td style="text-align: right;">${{ number_format($uniform['subtotal'], 2) }}</td>
                </tr>
                @endforeach
                <tr class="subtotal-row">
                    <td colspan="5"><strong>Costo Mensual de Uniformes</strong></td>
                    <td style="text-align: right;"><strong>${{ number_format($result['uniform_cost'], 2) }}</strong></td>
                </tr>
            </tbody>
        </table>
    </div>
    @endif

    <!-- Resumen Final -->
    <div class="section">
        <div class="section-title">RESUMEN FINANCIERO</div>
        <table>
            <tbody>
                <tr>
                    <td style="font-weight: bold;">Costo de Venta sin Financiamiento</td>
                    <td style="text-align: right;">${{ number_format($result['sale_cost_without_financing'], 2) }}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold;">Financiamiento (TIIE 15%)</td>
                    <td style="text-align: right;">${{ number_format($result['financing'], 2) }}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold;">Costo de Venta Total</td>
                    <td style="text-align: right;">${{ number_format($result['sale_cost_without_financing'] + $result['financing'], 2) }}</td>
                </tr>
                <tr>
                    <td style="font-weight: bold;">Utilidad (15%)</td>
                    <td style="text-align: right;">${{ number_format($result['utility'], 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Total Final -->
    <div class="total-box">
        <h2>PRECIO DE VENTA FINAL</h2>
        <div class="amount">${{ number_format($result['sale_price'], 2) }}</div>
        <p style="margin: 5px 0 0 0; font-size: 11px;">Monto mensual por elemento</p>
    </div>

    <div class="footer">
        <p><strong>Este documento es una cotización preliminar y está sujeto a cambios.</strong></p>
        <p>Válido por 30 días a partir de la fecha de emisión.</p>
        <p>Para más información, contacte con nuestro departamento comercial.</p>
    </div>
</body>
</html>