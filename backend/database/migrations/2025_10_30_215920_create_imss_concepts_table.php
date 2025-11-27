<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('imss_concepts', function (Blueprint $table) {
            $table->id();
            $table->string('description', 100);
            $table->string('type', 50);
            $table->string('employer_percentage', 50);
            $table->string('worker_percentage', 50);
            $table->string('total_percentage', 50);
            $table->string('calculation_base', 50);
            $table->string('regulatory_framework', 100);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('imss_concepts');
    }
};