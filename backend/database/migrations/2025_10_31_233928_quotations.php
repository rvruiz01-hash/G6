<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            
            // Usuario que realizó la cotización
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade')
                  ->comment('Usuario que realizó la cotización');
            
            // Folio único de cotización
            $table->string('folio', 50)->unique()->comment('Folio único de la cotización');
            
            // Datos de entrada
            $table->foreignId('business_line_id')
                  ->constrained('business_lines')
                  ->onDelete('restrict');
            
            $table->foreignId('shift_type_id')
                  ->constrained('shift_types')
                  ->onDelete('restrict');
            
            $table->char('federal_entity_id', 2);
            $table->foreign('federal_entity_id')
                  ->references('id')
                  ->on('federal_entities')
                  ->onDelete('restrict');
            
            $table->decimal('net_salary', 10, 2);
            $table->integer('total_elements');
            $table->integer('total_rest_days');
            $table->boolean('has_holidays')->default(false);
            $table->boolean('has_day_31')->default(false);
            
            // Resultados calculados
            $table->decimal('monthly_salary', 12, 2);
            $table->decimal('total_benefits', 12, 2);
            $table->decimal('total_social_charge', 12, 2);
            $table->decimal('state_tax', 12, 2);
            $table->decimal('total_cost_per_guard', 12, 2);
            $table->decimal('uniform_cost', 12, 2);
            $table->decimal('sale_cost_without_financing', 12, 2);
            $table->decimal('financing', 12, 2);
            $table->decimal('utility', 12, 2);
            $table->decimal('sale_price', 12, 2);
            
            // Desglose adicional
            $table->json('breakdown')->nullable();
            $table->json('uniforms')->nullable();
            
            $table->timestamps();
            
            // Índices
            $table->index('folio');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quotations');
    }
};