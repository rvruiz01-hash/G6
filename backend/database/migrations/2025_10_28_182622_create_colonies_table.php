<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('colonies', function (Blueprint $table) {
            $table->id();
            
            // Foreign key referencing municipalities.id
            $table->foreignId('municipality_id')
                ->constrained('municipalities')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            
            $table->string('name', 200);
            $table->string('postal_code', 5); // Código postal de 5 dígitos
            
            // Índices para mejorar el rendimiento de búsquedas
            $table->index('postal_code');
            $table->index(['municipality_id', 'postal_code']);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('colonies');
    }
};