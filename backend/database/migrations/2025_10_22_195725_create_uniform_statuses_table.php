<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('uniform_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('description', 50)->unique()->comment('Descripción del estatus del uniforme');
            $table->timestamps();
        });

        // Insertar los estatus predefinidos
        DB::table('uniform_statuses')->insert([
            ['id' => 1, 'description' => 'EN STOCK', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'description' => 'ASIGNADO', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'description' => 'EN LAVANDERÍA', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'description' => 'DADO DE BAJA', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uniform_statuses');
    }
};