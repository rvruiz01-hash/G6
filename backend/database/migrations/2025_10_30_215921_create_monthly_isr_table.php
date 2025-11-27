<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monthly_isr', function (Blueprint $table) {
            $table->id();
            $table->decimal('lower_limit', 10, 2);
            $table->decimal('upper_limit', 10, 2);
            $table->decimal('fixed_fee', 10, 2);
            $table->decimal('excess_percentage', 5, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monthly_isr');
    }
};