<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Cotización {{ $result['folio'] ?? '' }}</title>
    <style>
        @page {
            margin: 15mm;
            size: letter;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #333;
        }
        
        /* ====================== ENCABEZADO EMPRESA ====================== */
        .company-header {
            text-align: center;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .company-header h1 {
            font-size: 24pt;
            color: #0066cc;
            margin-bottom: 8px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        .company-info {
            font-size: 9pt;
            color: #666;
            line-height: 1.6;
        }
        
        .company-info-line {
            margin: 3px 0;
        }
        
        .separator {
            display: inline-block;
            margin: 0 10px;
            color: #0066cc;
        }
        
        /* ====================== INFORMACIÓN CLIENTE ====================== */
        .client-section {
            margin-bottom: 20px;
            padding: 12px;
            background-color: #f8f9fa;
            border-left: 4px solid #0066cc;
        }
        
        .client-title {
            font-size: 11pt;
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 8px;
            text-transform: uppercase;
        }
        
        .client-info {
            display: table;
            width: 100%;
        }
        
        .client-row {
            display: table-row;
        }
        
        .client-label {
            display: table-cell;
            width: 30%;
            font-weight: bold;
            padding: 4px 10px 4px 0;
            font-size: 9pt;
        }
        
        .client-value {
            display: table-cell;
            padding: 4px 0;
            font-size: 9pt;
        }
        
        /* ====================== DATOS COTIZACIÓN ====================== */
        .quotation-header {
            margin-bottom: 20px;
            border: 2px solid #0066cc;
            padding: 12px;
            background-color: #e8f4fd;
        }
        
        .quotation-header table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .quotation-header td {
            padding: 5px 10px;
            font-size: 9pt;
        }
        
        .quotation-label {
            font-weight: bold;
            color: #0066cc;
            width: 40%;
        }
        
        .quotation-value {
            color: #333;
        }
        
        /* ====================== SECCIÓN TÍTULOS ====================== */
        .section-title {
            background-color: #0066cc;
            color: white;
            padding: 8px 12px;
            font-size: 11pt;
            font-weight: bold;
            margin: 20px 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* ====================== TABLA DETALLES ====================== */
        .detail-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 9pt;
        }
        
        .detail-table th {
            background-color: #0066cc;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #0066cc;
        }
        
        .detail-table th.text-right,
        .detail-table td.text-right {
            text-align: right;
        }
        
        .detail-table th.text-center,
        .detail-table td.text-center {
            text-align: center;
        }
        
        .detail-table td {
            padding: 6px 8px;
            border: 1px solid #ddd;
            background-color: white;
        }
        
        .detail-table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        /* ====================== TABLA COSTOS ====================== */
        .cost-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 9pt;
        }
        
        .cost-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #eee;
        }
        
        .cost-table tr.category-row td {
            background-color: #e8f4fd;
            font-weight: bold;
            color: #0066cc;
            border-top: 2px solid #0066cc;
            border-bottom: 2px solid #0066cc;
        }
        
        .cost-table tr.item-row td {
            padding-left: 25px;
        }
        
        .cost-table tr.total-row td {
            background-color: #ffd700;
            font-weight: bold;
            font-size: 10pt;
            border-top: 3px solid #0066cc;
            border-bottom: 3px solid #0066cc;
        }
        
        .cost-label {
            width: 70%;
        }
        
        .cost-value {
            width: 30%;
            text-align: right;
            font-weight: bold;
        }
        
        /* ====================== RESUMEN FINANCIERO ====================== */
        .financial-summary {
            width: 100%;
            margin-bottom: 15px;
            border-collapse: collapse;
            font-size: 9pt;
        }
        
        .financial-summary td {
            padding: 8px 12px;
            border: 1px solid #ddd;
        }
        
        .financial-summary tr.subtotal-row td {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        .financial-label {
            width: 70%;
            font-weight: bold;
        }
        
        .financial-value {
            width: 30%;
            text-align: right;
        }
        
        /* ====================== TOTAL FINAL ====================== */
        .total-final-box {
            background: linear-gradient(135deg, #0066cc 0%, #004999 100%);
            color: white;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border-radius: 8px;
        }
        
        .total-final-box h2 {
            font-size: 13pt;
            margin-bottom: 10px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        
        .total-final-amount {
            font-size: 32pt;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .total-final-note {
            font-size: 9pt;
            font-style: italic;
            margin-top: 5px;
        }
        
        /* ====================== OBSERVACIONES ====================== */
        .observations-box {
            border: 2px solid #0066cc;
            padding: 12px;
            margin: 15px 0;
            background-color: #f8f9fa;
            min-height: 80px;
        }
        
        .observations-title {
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 8px;
            font-size: 10pt;
        }
        
        .observations-content {
            font-size: 9pt;
            line-height: 1.6;
            color: #555;
        }
        
        /* ====================== FIRMA ====================== */
        .signature-section {
            margin-top: 40px;
            text-align: center;
        }
        
        .signature-line {
            width: 250px;
            border-top: 2px solid #333;
            margin: 50px auto 10px auto;
        }
        
        .signature-text {
            font-size: 9pt;
            font-weight: bold;
            color: #333;
        }
        
        .signature-subtext {
            font-size: 8pt;
            color: #666;
            margin-top: 3px;
        }
        
        /* ====================== PIE DE PÁGINA ====================== */
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #0066cc;
            text-align: center;
            font-size: 8pt;
            color: #666;
            line-height: 1.6;
        }
        
        .footer-note {
            margin: 5px 0;
        }
        
        .footer-bold {
            font-weight: bold;
            color: #0066cc;
        }
    </style>
</head>
<body>
    
    <!-- ====================== ENCABEZADO EMPRESA ====================== -->
    <div class="company-header">
        <h1>COTIZACIÓN</h1>
        <div class="company-info">
            <div class="company-info-line">
                <strong>[NOMBRE DE LA EMPRESA]</strong>
            </div>
            <div class="company-info-line">
                [DIRECCIÓN DE LA EMPRESA]
            </div>
            <div class="company-info-line">
                <span class="separator">|</span> [TELÉFONO DE CONTACTO] <span class="separator">|</span> [CORREO ELECTRÓNICO]
            </div>
            <div class="company-info-line">
                [SITIO WEB]
            </div>
        </div>
    </div>
    
    <!-- ====================== INFORMACIÓN DEL CLIENTE ====================== -->
    <div class="client-section">
        <div class="client-title">Información del Cliente</div>
        <div class="client-info">
            <div class="client-row">
                <div class="client-label">Nombre/Razón Social:</div>
                <div class="client-value">[NOMBRE DEL CLIENTE]</div>
            </div>
            <div class="client-row">
                <div class="client-label">Dirección:</div>
                <div class="client-value">[DIRECCIÓN DEL CLIENTE]</div>
            </div>
            <div class="client-row">
                <div class="client-label">Teléfono:</div>
                <div class="client-value">[TELÉFONO DEL CLIENTE]</div>
            </div>
            <div class="client-row">
                <div class="client-label">Correo Electrónico:</div>
                <div class="client-value">[CORREO DEL CLIENTE]</div>
            </div>
        </div>
    </div>
    
    <!-- ====================== DATOS DE LA COTIZACIÓN ====================== -->
    <div class="quotation-header">
        <table>
            <tr>
                <td class="quotation-label">COTIZACIÓN Nº:</td>
                <td class="quotation-value"><strong>{{ $result['folio'] ?? 'N/A' }}</strong></td>
                <td class="quotation-label">No. DE VENDEDOR:</td>
                <td class="quotation-value"><strong>[VENDEDOR]</strong></td>
            </tr>
            <tr>
                <td class="quotation-label">Fecha:</td>
                <td class="quotation-value">{{ date('d/m/Y') }}</td>
                <td class="quotation-label">Validez:</td>
                <td class="quotation-value">30 días</td>
            </tr>
        </table>
    </div>
    
    <!-- ====================== DETALLE DEL SERVICIO ====================== -->
    <div class="section-title">Detalle del Servicio de Seguridad</div>
    
    <table class="detail-table">
        <thead>
            <tr>
                <th>CONCEPTO</th>
                <th class="text-center">CANTIDAD</th>
                <th class="text-right">DESCRIPCIÓN</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Línea de Negocio</strong></td>
                <td class="text-center">-</td>
                <td class="text-right">{{ $data['business_line'] ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Tipo de Turno</strong></td>
                <td class="text-center">-</td>
                <td class="text-right">{{ $data['shift_type'] ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Entidad Federativa</strong></td>
                <td class="text-center">-</td>
                <td class="text-right">{{ $data['federal_entity'] ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td><strong>Número de Elementos</strong></td>
                <td class="text-center">{{ $data['total_elements'] ?? 0 }}</td>
                <td class="text-right">Elementos de seguridad</td>
            </tr>
            <tr>
                <td><strong>Sueldo Neto Base</strong></td>
                <td class="text-center">-</td>
                <td class="text-right">${{ number_format($data['net_salary'] ?? 0, 2) }}</td>
            </tr>
            <tr>
                <td><strong>Días de Descanso</strong></td>
                <td class="text-center">{{ $data['total_rest_days'] ?? 0 }}</td>
                <td class="text-right">Por mes</td>
            </tr>
            @if($data['has_holidays'])
            <tr>
                <td><strong>Días Festivos</strong></td>
                <td class="text-center">✓</td>
                <td class="text-right">Incluidos</td>
            </tr>
            @endif
            @if($data['has_day_31'])
            <tr>
                <td><strong>Día 31</strong></td>
                <td class="text-center">✓</td>
                <td class="text-right">Incluido</td>
            </tr>
            @endif
        </tbody>
    </table>
    
    <!-- ====================== DESGLOSE DE COSTOS ====================== -->
    <div class="section-title">Desglose de Costos por Elemento</div>
    
    <table class="cost-table">
        <tbody>
            <!-- SUELDO MENSUAL -->
            <tr class="category-row">
                <td class="cost-label">SUELDO MENSUAL</td>
                <td class="cost-value">${{ number_format($result['monthly_salary'], 2) }}</td>
            </tr>
            <tr class="item-row">
                <td class="cost-label">• Sueldo Base</td>
                <td class="cost-value">${{ number_format($data['net_salary'], 2) }}</td>
            </tr>
            <tr class="item-row">
                <td class="cost-label">• Descansos</td>
                <td class="cost-value">${{ number_format($result['breakdown']['rest_days_pay'], 2) }}</td>
            </tr>
            @if($result['breakdown']['holiday_pay'] > 0)
            <tr class="item-row">
                <td class="cost-label">• Días Festivos</td>
                <td class="cost-value">${{ number_format($result['breakdown']['holiday_pay'], 2) }}</td>
            </tr>
            @endif
            @if($result['breakdown']['day_31_pay'] > 0)
            <tr class="item-row">
                <td class="cost-label">• Día 31</td>
                <td class="cost-value">${{ number_format($result['breakdown']['day_31_pay'], 2) }}</td>
            </tr>
            @endif
            
            <!-- PRESTACIONES -->
            <tr class="category-row">
                <td class="cost-label">PRESTACIONES</td>
                <td class="cost-value">${{ number_format($result['total_benefits'], 2) }}</td>
            </tr>
            <tr class="item-row">
                <td class="cost-label">• Vacaciones</td>
                <td class="cost-value">${{ number_format($result['breakdown']['vacations'], 2) }}</td>
            </tr>
            <tr class="item-row">
                <td class="cost-label">• Prima Vacacional</td>
                <td class="cost-value">${{ number_format($result['breakdown']['vacation_premium'], 2) }}</td>
            </tr>
            <tr class="item-row">
                <td class="cost-label">• Aguinaldo</td>
                <td class="cost-value">${{ number_format($result['breakdown']['christmas_bonus'], 2) }}</td>
            </tr>
            <tr class="item-row">
                <td class="cost-label">• Prima de Antigüedad</td>
                <td class="cost-value">${{ number_format($result['breakdown']['seniority_pay'], 2) }}</td>
            </tr>
            
            <!-- CARGA SOCIAL -->
            <tr class="category-row">
                <td class="cost-label">CARGA SOCIAL (IMSS)</td>
                <td class="cost-value">${{ number_format($result['total_social_charge'], 2) }}</td>
            </tr>
            
            <!-- IMPUESTOS -->
            <tr class="category-row">
                <td class="cost-label">IMPUESTO ESTATAL (ISR)</td>
                <td class="cost-value">${{ number_format($result['state_tax'], 2) }}</td>
            </tr>
            
            <!-- GASTOS ADMINISTRATIVOS -->
            <tr class="category-row">
                <td class="cost-label">GASTOS ADMINISTRATIVOS (10%)</td>
                <td class="cost-value">${{ number_format($result['breakdown']['admin_expenses'], 2) }}</td>
            </tr>
            
            <!-- COSTO TOTAL POR GUARDIA -->
            <tr class="total-row">
                <td class="cost-label">COSTO TOTAL POR GUARDIA</td>
                <td class="cost-value">${{ number_format($result['total_cost_per_guard'], 2) }}</td>
            </tr>
        </tbody>
    </table>
    
    <!-- ====================== UNIFORMES INCLUIDOS ====================== -->
    @if(!empty($data['uniforms']))
    <div class="section-title">Uniformes Incluidos en la Cotización</div>
    
    <table class="detail-table">
        <thead>
            <tr>
                <th>TIPO</th>
                <th>TALLA</th>
                <th>COLOR</th>
                <th class="text-center">CANTIDAD</th>
                <th class="text-right">PRECIO UNITARIO</th>
                <th class="text-right">TOTAL</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data['uniforms'] as $uniform)
            <tr>
                <td>{{ $uniform['uniform_type'] ?? 'N/A' }}</td>
                <td>{{ $uniform['size'] ?? 'N/A' }}</td>
                <td>{{ $uniform['color'] ?? 'N/A' }}</td>
                <td class="text-center">{{ $uniform['quantity'] }}</td>
                <td class="text-right">${{ number_format($uniform['max_unit_price'], 2) }}</td>
                <td class="text-right">${{ number_format($uniform['subtotal'], 2) }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background-color: #e8f4fd; font-weight: bold;">
                <td colspan="5" style="text-align: right; padding: 10px;"><strong>Costo Mensual de Uniformes:</strong></td>
                <td class="text-right" style="padding: 10px;"><strong>${{ number_format($result['uniform_cost'], 2) }}</strong></td>
            </tr>
        </tfoot>
    </table>
    @endif
    
    <!-- ====================== RESUMEN FINANCIERO ====================== -->
    <div class="section-title">Resumen Financiero</div>
    
    <table class="financial-summary">
        <tbody>
            <tr>
                <td class="financial-label">Subtotal (Costo + Uniformes):</td>
                <td class="financial-value">${{ number_format($result['sale_cost_without_financing'], 2) }}</td>
            </tr>
            <tr>
                <td class="financial-label">Financiamiento (TIIE 15%):</td>
                <td class="financial-value">${{ number_format($result['financing'], 2) }}</td>
            </tr>
            <tr class="subtotal-row">
                <td class="financial-label">Costo de Venta Total:</td>
                <td class="financial-value">${{ number_format($result['sale_cost_without_financing'] + $result['financing'], 2) }}</td>
            </tr>
            <tr>
                <td class="financial-label">Utilidad (15%):</td>
                <td class="financial-value">${{ number_format($result['utility'], 2) }}</td>
            </tr>
        </tbody>
    </table>
    
    <!-- ====================== TOTAL FINAL ====================== -->
    <div class="total-final-box">
        <h2>PRECIO DE VENTA FINAL</h2>
        <div class="total-final-amount">${{ number_format($result['sale_price'], 2) }}</div>
        <div class="total-final-note">Precio mensual por elemento de seguridad</div>
    </div>
    
    <!-- ====================== FORMA DE PAGO ====================== -->
    <div class="section-title">Forma de Pago</div>
    <div class="observations-box">
        <div class="observations-content">
            [DETALLE DE LAS FORMAS DE PAGO, EJEMPLO: TRANSFERENCIA BANCARIA, CHEQUE, DEPÓSITO EN EFECTIVO, ETC.]
        </div>
    </div>
    
    <!-- ====================== DATOS BANCARIOS ====================== -->
    <div class="section-title">Datos Bancarios</div>
    <table class="detail-table">
        <tbody>
            <tr>
                <td style="width: 30%; font-weight: bold;">Banco:</td>
                <td>[NOMBRE DEL BANCO]</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Tipo de Cuenta:</td>
                <td>[TIPO DE CUENTA]</td>
            </tr>
            <tr>
                <td style="font-weight: bold;">Número de Cuenta:</td>
                <td>[NÚMERO DE CUENTA]</td>
            </tr>
        </tbody>
    </table>
    
    <!-- ====================== OBSERVACIONES ====================== -->
    <div class="section-title">Observaciones</div>
    <div class="observations-box">
        <div class="observations-content">
            • Esta cotización tiene una validez de 30 días naturales a partir de la fecha de emisión.<br>
            • Los precios están sujetos a cambios sin previo aviso.<br>
            • Las condiciones de entrega, instalación o capacitación del personal se acordarán por separado.<br>
            • [CUALQUIER INFORMACIÓN ADICIONAL RELEVANTE]
        </div>
    </div>
    
    <!-- ====================== FIRMA ====================== -->
    <div class="signature-section">
        <div class="signature-line"></div>
        <div class="signature-text">Atentamente,</div>
        <div class="signature-subtext">[NOMBRE Y FIRMA DEL RESPONSABLE]</div>
        <div class="signature-subtext">[CARGO]</div>
        <div class="signature-subtext">[NOMBRE DE LA EMPRESA]</div>
    </div>
    
    <!-- ====================== PIE DE PÁGINA ====================== -->
    <div class="footer">
        <div class="footer-note footer-bold">
            Este documento es una cotización preliminar y está sujeto a cambios.
        </div>
        <div class="footer-note">
            Generado el {{ date('d/m/Y H:i') }} | Folio: {{ $result['folio'] ?? 'N/A' }}
        </div>
        <div class="footer-note">
            Para más información, contacte con nuestro departamento comercial.
        </div>
    </div>
    
</body>
</html>