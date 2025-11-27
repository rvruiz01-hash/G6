<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBusinessLinesTable extends Migration
{
    public function up()
    {
        Schema::create('business_lines', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique()->comment('Linea de negocio (ej: Seguridad Fisica).');
            $table->boolean('status')->default(1); // 1 = activo, 0 = pausa
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('business_lines');
    }
}
