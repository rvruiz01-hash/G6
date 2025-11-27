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
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            
            // Información básica
            $table->string('contractor_number', 10)->unique()->comment('Número de contratante');
            $table->string('legal_name', 190)->comment('Razón social (nombre legal)');
            $table->string('trade_name', 200)->nullable()->comment('Nombre comercial');
            $table->string('rfc', 13)->nullable()->unique()->comment('RFC del proveedor');
            
            // Información de contacto
            $table->string('contact_person', 100)->comment('Persona de contacto');
            $table->string('contact_number', 10)->nullable()->comment('Número de contacto');
            $table->string('email', 100)->unique()->comment('Email del proveedor');
            $table->string('phone', 10)->comment('Teléfono principal');
            $table->string('website', 200)->nullable()->comment('Página web del proveedor');
            
            // Información bancaria
            $table->foreignId('bank_id')
                ->nullable()
                ->constrained('banks')
                ->nullOnDelete('restrict')
                ->comment('Relación con el banco');
            
            $table->string('account_number', 20)->nullable()->comment('Número de cuenta bancaria');
            $table->string('clabe', 18)->nullable()->comment('CLABE interbancaria (18 dígitos)');
            
            // Información fiscal y ubicación
            $table->text('fiscal_address')->comment('Domicilio fiscal completo');
            $table->string('postal_code', 10)->nullable()->comment('Código postal');

            $table->char('federal_entity_id', 2)->nullable();
            $table->foreign('federal_entity_id')
                  ->references('id')
                  ->on('federal_entities')
                  ->nullOnDelete()
                  ->comment('Relación con la entidad federativa');

            $table->foreignId('municipality_id')
                ->nullable()
                ->constrained('municipalities')
                ->onDelete('set null')
                ->comment('Relación con el municipio');
            $table->foreignId('colony_id')
                ->nullable()
                ->constrained('colonies')
                ->onDelete('set null')
                ->comment('Relación con la colonia');    
            
            // Información adicional
            $table->text('notes')->nullable()->comment('Notas u observaciones adicionales');
            $table->boolean('status')->default(true)->comment('Estatus activo/inactivo');
            $table->timestamps();

            // Índices para mejorar búsquedas
            $table->index('legal_name');
            $table->index('rfc');
            $table->index('contractor_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};