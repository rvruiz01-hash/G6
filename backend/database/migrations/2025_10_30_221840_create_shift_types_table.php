<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shift_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->foreignId('business_line_id')->constrained('business_lines');
            $table->unsignedInteger('total_rest_days');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_types');
    }
};