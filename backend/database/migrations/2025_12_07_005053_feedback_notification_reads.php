<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('feedback_notification_reads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('notification_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            // Claves foráneas
            $table->foreign('notification_id')
                  ->references('id')
                  ->on('feedback_notifications')
                  ->onDelete('cascade');
            
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
            
            // Índice único para evitar duplicados
            $table->unique(['notification_id', 'user_id']);
        });

        // Eliminar columnas read y read_at de feedback_notifications ya que ahora usamos la tabla pivot
        Schema::table('feedback_notifications', function (Blueprint $table) {
            $table->dropColumn(['read', 'read_at']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('feedback_notification_reads');
        // Restaurar columnas
        Schema::table('feedback_notifications', function (Blueprint $table) {
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
        });
    }
};