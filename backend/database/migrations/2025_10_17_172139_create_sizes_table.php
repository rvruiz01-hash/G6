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
        Schema::create('sizes', function (Blueprint $table) {
            $table->id();
            
            $table->string('description', 100)->comment('Descripción de la talla (ej: S, M, L, XL, 28, 30, 32)');
            
            // Llaves foráneas
            $table->foreignId('sexe_id')
                  ->constrained('sexes')
                  ->comment('Relación con la sexo');
                  
            $table->foreignId('body_part_id')
                  ->constrained('body_parts')
                  ->comment('Relación con la parte corporal');
            
            $table->boolean('status')->default(true)->comment('Estatus activo/inactivo de la talla');
            
            $table->timestamps();
            
            // Índice único compuesto: una combinación de descripción + sexo + parte corporal debe ser única
            $table->unique(['description', 'sexe_id', 'body_part_id'], 'sizes_unique_combination');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sizes');
    }
};