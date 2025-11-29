<?php

namespace App\Services;

use setasign\Fpdi\Tcpdf\Fpdi;

class QuoterPdfService extends Fpdi
{
    private $templatePath;
    private $currentY;
    private $pageWidth;
    private $pageHeight;
    private $marginLeft = 20;
    private $marginRight = 20;
    private $contentStartY = 50; // Donde termina el encabezado (ajustar segÃºn necesites)
    
    public function __construct()
    {
        parent::__construct('P', 'mm', 'LETTER', true, 'UTF-8', false);
        
        $this->templatePath = storage_path('app/templates/Pdf_Quoter.pdf');
        $this->pageWidth = 215.9; // Letter width in mm
        $this->pageHeight = 279.4; // Letter height in mm
        
        $this->SetCreator('Sistema G6');
        $this->SetAuthor('Sistema de CotizaciÃ³n');
        $this->SetTitle('CotizaciÃ³n de Servicio');
        
        // ConfiguraciÃ³n de fuente
        $this->SetFont('helvetica', '', 10);
        $this->SetAutoPageBreak(true, 15);
    }
    
    /**
     * Agregar una nueva pÃ¡gina con la plantilla
     */
    public function addTemplatedPage()
    {
        $this->AddPage();
        
        // Importar la plantilla PDF
        $this->setSourceFile($this->templatePath);
        $tplIdx = $this->importPage(1);
        $this->useTemplate($tplIdx, 0, 0, $this->pageWidth, $this->pageHeight);
        
        // Resetear la posiciÃ³n Y al inicio del contenido
        $this->currentY = $this->contentStartY;
        $this->SetY($this->currentY);
    }
    
    /**
     * Agregar nombre de empresa en el encabezado
     */
public function addCompanyName($companyName = '[NOMBRE DE LA EMPRESA]')
{
    $this->SetFont('helvetica', 'B', 11);
    $this->SetXY(60, 15); // Posición entre los dos logos
    $this->Cell(95, 8, mb_convert_encoding($companyName, 'ISO-8859-1', 'UTF-8'), 0, 0, 'C');
    $this->SetFont('helvetica', '', 10);
    
    // ✅ RESETEAR POSICIÓN Y AL INICIO DEL CONTENIDO
    $this->SetY($this->contentStartY);
}
    /**
     * Agregar tÃ­tulo de secciÃ³n
     */
    public function addSectionTitle($title)
    {
        $this->checkPageBreakCustom(15);
        
        $this->SetFont('helvetica', 'B', 12);
        $this->SetFillColor(0, 102, 204); // Azul
        $this->SetTextColor(255, 255, 255); // Blanco
        $this->Cell(0, 8, mb_convert_encoding($title, 'ISO-8859-1', 'UTF-8'), 0, 1, 'L', true);
        $this->Ln(3);
        
        $this->SetTextColor(0, 0, 0); // Volver a negro
        $this->SetFont('helvetica', '', 10);
    }
    
    /**
     * Agregar tabla de 2 columnas (label y valor)
     */
    public function addInfoTable($data)
    {
        $this->checkPageBreakCustom(20);
        
        $this->SetFont('helvetica', '', 9);
        
        foreach ($data as $row) {
            $label = $row['label'];
            $value = $row['value'];
            
            $this->checkPageBreakCustom(8);
            
            // Label (negrita)
            $this->SetFont('helvetica', 'B', 9);
            $this->Cell(60, 6, mb_convert_encoding($label, 'ISO-8859-1', 'UTF-8'), 1, 0, 'L', false);
            
            // Value (normal)
            $this->SetFont('helvetica', '', 9);
            $this->Cell(0, 6, mb_convert_encoding($value, 'ISO-8859-1', 'UTF-8'), 1, 1, 'L', false);
        }
        
        $this->Ln(3);
    }
    
    /**
     * Agregar tabla de desglose de costos
     */
    public function addCostBreakdownTable($costs)
    {
        $this->checkPageBreakCustom(20);
        
        foreach ($costs as $cost) {
            $this->checkPageBreakCustom(8);
            
            if ($cost['type'] === 'category') {
                // CategorÃ­a (fondo azul)
                $this->SetFont('helvetica', 'B', 9);
                $this->SetFillColor(232, 244, 253); // Azul claro
                $this->SetTextColor(0, 102, 204);
                $this->Cell(130, 6, mb_convert_encoding($cost['label'], 'ISO-8859-1', 'UTF-8'), 1, 0, 'L', true);
                $this->Cell(45, 6, mb_convert_encoding($cost['value'], 'ISO-8859-1', 'UTF-8'), 1, 1, 'R', true);
                $this->SetTextColor(0, 0, 0);
            } elseif ($cost['type'] === 'item') {
                // Item (normal)
                $this->SetFont('helvetica', '', 9);
                $this->Cell(130, 6, '   ' . mb_convert_encoding($cost['label'], 'ISO-8859-1', 'UTF-8'), 1, 0, 'L', false);
                $this->Cell(45, 6, mb_convert_encoding($cost['value'], 'ISO-8859-1', 'UTF-8'), 1, 1, 'R', false);
            } elseif ($cost['type'] === 'total') {
                // Total (fondo amarillo)
                $this->SetFont('helvetica', 'B', 10);
                $this->SetFillColor(255, 215, 0); // Amarillo/dorado
                $this->Cell(130, 7, mb_convert_encoding($cost['label'], 'ISO-8859-1', 'UTF-8'), 1, 0, 'L', true);
                $this->Cell(45, 7, mb_convert_encoding($cost['value'], 'ISO-8859-1', 'UTF-8'), 1, 1, 'R', true);
            }
        }
        
        $this->Ln(3);
    }
    
    /**
     * Agregar tabla de uniformes
     */
    public function addUniformsTable($uniforms)
    {
        $this->checkPageBreakCustom(25);
        
        // Encabezados
        $this->SetFont('helvetica', 'B', 9);
        $this->SetFillColor(0, 102, 204);
        $this->SetTextColor(255, 255, 255);
        
        $this->Cell(40, 7, 'TIPO', 1, 0, 'C', true);
        $this->Cell(25, 7, 'TALLA', 1, 0, 'C', true);
        $this->Cell(25, 7, 'COLOR', 1, 0, 'C', true);
        $this->Cell(20, 7, 'CANT.', 1, 0, 'C', true);
        $this->Cell(30, 7, 'P. UNITARIO', 1, 0, 'C', true);
        $this->Cell(35, 7, 'TOTAL', 1, 1, 'C', true);
        
        $this->SetTextColor(0, 0, 0);
        $this->SetFont('helvetica', '', 8);
        
        // Filas de datos
        foreach ($uniforms as $uniform) {
            $this->checkPageBreakCustom(8);
            
            $this->Cell(40, 6, mb_convert_encoding($uniform['type'], 'ISO-8859-1', 'UTF-8'), 1, 0, 'L');
            $this->Cell(25, 6, mb_convert_encoding($uniform['size'], 'ISO-8859-1', 'UTF-8'), 1, 0, 'C');
            $this->Cell(25, 6, mb_convert_encoding($uniform['color'], 'ISO-8859-1', 'UTF-8'), 1, 0, 'C');
            $this->Cell(20, 6, $uniform['quantity'], 1, 0, 'C');
            $this->Cell(30, 6, '$' . number_format($uniform['unit_price'], 2), 1, 0, 'R');
            $this->Cell(35, 6, '$' . number_format($uniform['subtotal'], 2), 1, 1, 'R');
        }
        
        $this->Ln(3);
    }
    
    /**
     * Agregar total final destacado
     */
    public function addFinalTotal($label, $amount)
    {
        $this->checkPageBreakCustom(25);
        
        // Caja azul con gradiente (simulado con fill)
        $this->SetFillColor(0, 102, 204);
        $this->SetTextColor(255, 255, 255);
        
        $this->SetFont('helvetica', 'B', 13);
        $this->Cell(0, 10, mb_convert_encoding($label, 'ISO-8859-1', 'UTF-8'), 0, 1, 'C', true);
        
        $this->SetFont('helvetica', 'B', 24);
        $this->Cell(0, 15, '$' . number_format($amount, 2), 0, 1, 'C', true);
        
        $this->SetFont('helvetica', 'I', 9);
        $this->Cell(0, 6, 'Precio mensual por elemento de seguridad', 0, 1, 'C', true);
        
        $this->SetTextColor(0, 0, 0);
        $this->Ln(5);
    }
    
    /**
     * Agregar texto de observaciones
     */
    public function addObservations($text)
    {
        $this->checkPageBreakCustom(30);
        
        $this->SetFont('helvetica', '', 9);
        $this->MultiCell(0, 5, mb_convert_encoding($text, 'ISO-8859-1', 'UTF-8'), 1, 'L', false);
        $this->Ln(3);
    }
    
    /**
     * Verificar si necesita salto de pÃ¡gina (mÃ©todo personalizado)
     */
    protected function checkPageBreakCustom($height)
    {
        if ($this->GetY() + $height > $this->pageHeight - 20) {
            $this->addTemplatedPage();
        }
    }
}