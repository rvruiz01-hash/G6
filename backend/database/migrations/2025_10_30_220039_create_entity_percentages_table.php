<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entity_percentages', function (Blueprint $table) {
            $table->id();
            $table->decimal('percentage', 5, 2);
            $table->string('federal_entity_id', 2);
            $table->foreignId('business_line_id')->constrained('business_lines');
            $table->timestamps();

            $table->foreign('federal_entity_id')->references('id')->on('federal_entities');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entity_percentages');
    }
};