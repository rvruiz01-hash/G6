<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('legal_name', 190)->unique();
            $table->string('trade_name', 190)->nullable();
            $table->string('email', 190)->nullable()->unique();
            $table->string('cellphone_number', 15)->nullable()->unique();
            $table->string('rfc', 13)->nullable()->unique();
            $table->string('contact_person', 190)->nullable();
            //

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
