<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Sabberworm\CSS\Position\Position;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('paternal_last_name', 100);
            $table->string('maternal_last_name', 100)->nullable();
            $table->string('photo')->nullable();
            $table->foreignId('position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->string('email', 100)->nullable()->unique();
            $table->string('cellphone_number', 15)->nullable()->unique();
            $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('staffing_plan_id')->nullable()->constrained('staffing_plans')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('employee_status_id')
            ->constrained('employee_statuses')
            ->default(1)
            ->cascadeOnUpdate()
            ->restrictOnDelete();


            $table->timestamps();

            // Índices para optimización
            $table->index('user_id');
            $table->unique('user_id'); // Un usuario solo puede tener un empleado
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
