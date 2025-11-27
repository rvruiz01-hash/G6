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
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150)->comment('Nombre de la sucursal');
            $table->string('code', 20)->unique()->comment('Código único de la sucursal');
            
            // Relación con federal_entities
            $table->char('federal_entity_id', 2)
                  ->comment('ID de la entidad federativa');
            
            $table->foreign('federal_entity_id')
                  ->references('id')
                  ->on('federal_entities')
                  ->onDelete('restrict');
            
            // Información adicional
            $table->string('address', 250)->nullable()->comment('Dirección de la sucursal');
            $table->string('phone', 20)->nullable()->comment('Teléfono de contacto');
            $table->string('email', 100)->nullable()->comment('Email de contacto');
            
            $table->boolean('status')->default(true)->comment('Estatus activo/inactivo');
            $table->timestamps();
            
            // Índices para búsquedas rápidas
            $table->index('federal_entity_id');
            $table->index('name');
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};