<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('federal_entities', function (Blueprint $table) {
            $table->char('id', 2)->primary(); // Example: 01, 02, etc.
            $table->string('name', 100);
            $table->string('abbreviation', 10)->nullable();
            $table->foreignId('region_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('federal_entities');
    }
};
