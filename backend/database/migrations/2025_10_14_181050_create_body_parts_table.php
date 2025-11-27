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
        // El nombre de la tabla ahora sigue la convención de Laravel: inglés y plural
        Schema::create('body_parts', function (Blueprint $table) {
            // Define la clave primaria autoincremental (id)
            $table->id();
            
            // Columna en inglés, siguiendo la convención de Laravel.
            $table->string('description', 100)->unique()->comment('Descripción del lugar corporal (ej: brazo, pierna, abdomen).');
            // Columnas 'created_at' y 'updated_at' automáticas (buena práctica)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Elimina la tabla body_parts
        Schema::dropIfExists('body_parts');
    }
};
