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
        Schema::create('uniform_types', function (Blueprint $table) {
            $table->id();
            
            $table->string('description', 100)->comment('Descripción del tipo de uniforme');
            
            // Llaves foráneas
            $table->foreignId('body_part_id')
                  ->constrained('body_parts')
                  ->onDelete('restrict')
                  ->comment('Relación con la parte corporal');
                  
            $table->foreignId('business_line_id')
                  ->constrained('business_lines')
                  ->onDelete('restrict')
                  ->comment('Relación con la línea de negocio');
            
            $table->foreignId('sexe_id')
                  ->constrained('sexes')
                  ->onDelete('restrict')
                  ->comment('Relación con el sexo');
                  
            $table->foreignId('color_id')
                  ->constrained('colors')
                  ->onDelete('restrict')
                  ->comment('Relación con el color');
            
            $table->boolean('status')->default(true)->comment('Estatus activo/inactivo');
            
            $table->timestamps();
            
            // Índice único compuesto para evitar duplicados
            $table->unique(
                ['description', 'body_part_id', 'business_line_id', 'sexe_id', 'color_id'],
                'uniform_types_unique_combination'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uniform_types');
    }
};