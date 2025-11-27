<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            
            // Información básica de la factura
            $table->string('folio', 20)->unique()->comment('Folio único de la factura');
            
            // Relaciones
            $table->foreignId('supplier_id')
                  ->constrained('suppliers')
                  ->onDelete('restrict')
                  ->comment('Proveedor de la factura');
            
            $table->foreignId('business_line_id')
                  ->constrained('business_lines')
                  ->onDelete('restrict')
                  ->comment('Línea de negocio');
            
            // Información de pago
            $table->enum('payment_type', ['CONTADO', 'CREDITO'])->comment('Tipo de pago');
            $table->tinyInteger('payment_months')->nullable()->comment('Meses de crédito (1-12), null si es contado');

            // nuevos campos
            $table->decimal('shipping_cost', 10, 2)->nullable(); // hasta 99999999.99
            $table->decimal('freight_withholding', 10, 2)->nullable();
            $table->decimal('discount', 10, 2)->nullable();
            
            // Totales
            $table->decimal('subtotal', 12, 2)->comment('Subtotal sin IVA');
            $table->decimal('iva', 12, 2)->comment('IVA (16%)');
            $table->decimal('total', 12, 2)->comment('Total con IVA');
            
            // Destino
            $table->char('federal_entity_id', 2)
                  ->comment('Entidad federativa a recibir');
            
            $table->foreign('federal_entity_id')
                  ->references('id')
                  ->on('federal_entities')
                  ->onDelete('restrict');
            
            $table->foreignId('branch_id')
                  ->constrained('branches')
                  ->onDelete('restrict')
                  ->comment('Sucursal a recibir');
            
            // Estados de pago
            $table->boolean('merchandise_paid')->default(false)->comment('Mercancía pagada');
            $table->boolean('invoice_paid')->default(false)->comment('Factura pagada');
            $table->string('invoice_file')->nullable()->comment('Archivo de factura');
            
            $table->timestamps();
            
            // Índices
            $table->index('folio');
            $table->index('supplier_id');
            $table->index('business_line_id');
            $table->index(['federal_entity_id', 'branch_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};