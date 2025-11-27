<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_risk_premiums', function (Blueprint $table) {
            $table->id();
            $table->string('registration_id', 30);
            $table->year('year');
            $table->string('month', 2);
            $table->decimal('amount', 8, 4);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_risk_premiums');
    }
};