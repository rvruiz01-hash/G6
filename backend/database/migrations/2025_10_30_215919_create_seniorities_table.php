<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seniorities', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('years');
            $table->unsignedInteger('vacation_days');
            $table->unsignedInteger('vacation_premium_percentage');
            $table->unsignedInteger('seniority_days');
            $table->unsignedInteger('christmas_bonus_days');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seniorities');
    }
};