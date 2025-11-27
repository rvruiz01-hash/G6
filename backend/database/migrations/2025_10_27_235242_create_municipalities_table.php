<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('municipalities', function (Blueprint $table) {
            $table->id();
            
            // Foreign key referencing federal_entities.id (which is char(2))
            $table->char('federal_entity_id', 2);
            $table->foreign('federal_entity_id')
                ->references('id')
                ->on('federal_entities')
                ->onUpdate('cascade')
                ->onDelete('restrict');
            
            $table->string('name', 150);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('municipalities');
    }
};
