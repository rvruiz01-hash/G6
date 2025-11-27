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
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('icon_svg')->nullable()->comment('Nombre del archivo SVG');
            $table->string('path')->nullable()->comment('Ruta del módulo');
            $table->boolean('status')->default(true);
            $table->unsignedBigInteger('parent_id')->nullable()->comment('Para submódulos');
            $table->boolean('is_parent')->default(false)->comment('Indica si es módulo padre');
            
            $table->foreign('parent_id')->references('id')->on('modules')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
