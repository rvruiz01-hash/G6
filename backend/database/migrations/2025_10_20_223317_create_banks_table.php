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
        Schema::create('banks', function (Blueprint $table) {
            $table->id();
            
            $table->string('name', 100)->unique()->comment('Nombre del banco (ej: BBVA, Santander)');
            
            $table->string('code', 3)->unique()->comment('Código del banco (3 dígitos, ej: 012, 014)');
            
            $table->boolean('status')->default(true)->comment('Estatus activo/inactivo');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banks');
    }
};