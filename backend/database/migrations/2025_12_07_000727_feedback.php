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
        // 🎯 TABLA PRINCIPAL DE FEEDBACK
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            
            // Información del reporte
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('module'); // Nombre del módulo
            $table->string('url'); // URL donde ocurrió
            $table->enum('type', ['error', 'improvement']); // Tipo de feedback
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            
            // Campos del reporte
            $table->string('title'); // Título del reporte
            $table->text('description'); // Descripción general
            $table->text('steps_to_reproduce')->nullable(); // Para errores
            $table->text('expected_behavior'); // Comportamiento esperado / Beneficio
            $table->text('actual_behavior'); // Comportamiento actual / Situación actual
            $table->enum('frequency', ['always', 'sometimes', 'once'])->nullable(); // Para errores
            $table->string('affected_users'); // Usuarios afectados/beneficiados
            $table->text('additional_info')->nullable(); // Información adicional (opcional)
            $table->json('screenshots')->nullable(); // Rutas de capturas de pantalla
            $table->text('user_agent')->nullable(); // Información del navegador
            
            // Estado y gestión
            $table->enum('status', ['pending', 'in_progress', 'resolved', 'rejected', 'reopened'])->default('pending');
            $table->text('rejected_notes')->nullable(); 
            
            // 🎯 INFORMACIÓN DE RESOLUCIÓN
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null'); // Quién lo resolvió
            $table->timestamp('resolved_at')->nullable(); // Cuándo se resolvió
            $table->text('resolution_description')->nullable(); // Descripción de la solución implementada
            $table->string('resolution_version')->nullable(); // Versión donde se implementó (ej: v2.1.5)
            // Tiempos y métricas
            $table->integer('time_to_resolve')->nullable(); // Minutos desde creación hasta resolución
            // Estadísticas
            $table->integer('messages_count')->default(0); // Cantidad de mensajes en el chat
            $table->timestamps();
            
            // Índices para búsquedas rápidas
            $table->index('status');
            $table->index('type');
            $table->index('priority');
            $table->index('user_id');
            $table->index('resolved_by');
            $table->index('created_at');
            $table->index('resolved_at');
        });

        // 🎯 TABLA DE MENSAJES DEL CHAT
        Schema::create('feedback_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('message');
            $table->json('attachments')->nullable(); // Archivos adjuntos en el chat (imágenes, docs)
            $table->boolean('is_internal')->default(false); // Mensaje solo visible para admins
            $table->boolean('is_system')->default(false); // Mensaje automático del sistema
            $table->timestamp('read_at')->nullable(); // Cuándo fue leído por el destinatario
            $table->timestamps();
            
            // Índices
            $table->index('feedback_id');
            $table->index('user_id');
            $table->index('created_at');
            $table->index('is_internal');
        });

        // 🎯 TABLA DE NOTIFICACIONES
        Schema::create('feedback_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feedback_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->string('type'); // new_message, status_changed, assigned, resolved
            $table->text('message');
            $table->json('data')->nullable(); // Datos adicionales
            $table->boolean('read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            // Índices
            $table->index('role_id');
            $table->index('read');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback_notifications');
        Schema::dropIfExists('feedback_messages');
        Schema::dropIfExists('feedback');
    }
};