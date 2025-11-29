<?php

// ============================================================
// SCRIPT DE PRUEBA - test_fpdi.php
// ============================================================
// Guarda este archivo en: D:\G6\backend\test_fpdi.php
// Y ejecuta: php test_fpdi.php
// ============================================================

require __DIR__.'/vendor/autoload.php';

use setasign\Fpdi\Tcpdf\Fpdi;

try {
    echo "🔍 Iniciando prueba de FPDI...\n\n";
    
    $pdfPath = __DIR__.'/storage/app/templates/Pdf_Quoter.pdf';
    
    echo "📂 Verificando archivo: {$pdfPath}\n";
    
    if (!file_exists($pdfPath)) {
        die("❌ ERROR: El archivo no existe\n");
    }
    
    echo "✅ Archivo existe\n";
    echo "📊 Tamaño: " . filesize($pdfPath) . " bytes\n\n";
    
    echo "🚀 Intentando crear instancia de FPDI...\n";
    $pdf = new Fpdi('P', 'mm', 'LETTER', true, 'UTF-8', false);
    echo "✅ Instancia FPDI creada\n\n";
    
    echo "📖 Intentando leer el PDF...\n";
    $pageCount = $pdf->setSourceFile($pdfPath);
    echo "✅ PDF leído exitosamente\n";
    echo "📄 Total de páginas: {$pageCount}\n\n";
    
    echo "🎨 Intentando importar página 1...\n";
    $tplIdx = $pdf->importPage(1);
    echo "✅ Página 1 importada (template index: {$tplIdx})\n\n";
    
    echo "📝 Creando nueva página y usando la plantilla...\n";
    $pdf->AddPage();
    $pdf->useTemplate($tplIdx, 0, 0, 215.9, 279.4);
    echo "✅ Plantilla aplicada correctamente\n\n";
    
    echo "💾 Intentando generar el PDF...\n";
    $output = $pdf->Output('S'); // Output as string
    echo "✅ PDF generado exitosamente\n";
    echo "📊 Tamaño del PDF generado: " . strlen($output) . " bytes\n\n";
    
    echo "🎉 ¡TODAS LAS PRUEBAS PASARON!\n";
    echo "✅ FPDI puede leer y usar tu plantilla PDF sin problemas\n\n";
    
} catch (\Exception $e) {
    echo "\n❌ ERROR ENCONTRADO:\n";
    echo "Mensaje: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}