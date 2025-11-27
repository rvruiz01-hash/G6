<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('umas', function (Blueprint $table) {
            $table->id();
            $table->year('year');
            $table->decimal('daily', 8, 2);
            $table->decimal('monthly', 8, 2);
            $table->decimal('annual', 8, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('umas');
    }
};