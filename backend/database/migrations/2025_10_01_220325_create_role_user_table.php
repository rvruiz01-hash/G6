<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('role_user', function (Blueprint $table) {
    $table->id();

    $table->unsignedBigInteger('user_id');
    $table->unsignedBigInteger('role_id');
    $table->boolean('is_primary')->default(false);

    $table->foreign('user_id')
          ->references('id')
          ->on('users')
          ->onDelete('cascade');

    $table->foreign('role_id')
          ->references('id')
          ->on('roles')
          ->onDelete('cascade');

    $table->timestamps();

    // Un usuario no puede tener el mismo rol dos veces
    $table->unique(['user_id', 'role_id']); // evitar duplicar el mismo rol

    // Un usuario solo puede tener un rol principal
    //$table->unique(['user_id', 'is_primary'], 'role_user_primary_unique');
});

         //DB::statement('CREATE UNIQUE INDEX role_user_primary_unique ON role_user (user_id) WHERE is_primary = 1');
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_user');
    }
};
