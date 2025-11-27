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
        Schema::create('uniform_stock', function (Blueprint $table) {
            $table->id();
            
            // Relación con la factura
            $table->foreignId('invoice_id')
                  ->constrained('invoices')
                  ->onDelete('cascade')
                  ->comment('Factura a la que pertenece');
            
            // Tipo de mercancía (Uniform Type)
            $table->foreignId('uniform_type_id')
                  ->constrained('uniform_types')
                  ->onDelete('restrict')
                  ->comment('Tipo de uniforme/mercancía');
            
            // Talla
            $table->foreignId('size_id')
                  ->constrained('sizes')
                  ->onDelete('restrict')
                  ->comment('Talla del uniforme');

            $table->foreignId('color_id')
              ->constrained('colors')
              ->onDelete('restrict')
              ->comment('Color del uniforme');
            
            // Código generado automáticamente
            $table->string('code', 50)->comment('Código identificador del uniforme');
            
            // Cantidades y precios
            $table->integer('quantity')->comment('Cantidad de uniformes');
            $table->decimal('unit_price', 10, 2)->comment('Precio unitario');
            $table->decimal('subtotal', 12, 2)->comment('Subtotal (cantidad * precio unitario)');
            
            // Estado del uniforme
            $table->foreignId('uniform_status_id')
                  ->default(1) // EN STOCK por defecto
                  ->constrained('uniform_statuses')
                  ->onDelete('restrict')
                  ->comment('Estado actual del uniforme');
            
            $table->timestamps();
            
            // Índices
            $table->index('invoice_id');
            $table->index('uniform_type_id');
            $table->index('code');
            $table->index('uniform_status_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uniform_stock');
    }
};