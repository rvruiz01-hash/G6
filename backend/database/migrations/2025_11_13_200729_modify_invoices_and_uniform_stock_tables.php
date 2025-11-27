<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Verificar y agregar invoice_file solo si NO existe
        if (!Schema::hasColumn('invoices', 'invoice_file')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->string('invoice_file', 191)->nullable()->after('invoice_paid')
                      ->comment('Ruta del archivo PDF/imagen de la factura');
            });
        }

        // Verificar y agregar observations solo si NO existe
        if (!Schema::hasColumn('uniform_stock', 'observations')) {
            Schema::table('uniform_stock', function (Blueprint $table) {
                $table->text('observations')->nullable()->after('uniform_status_id')
                      ->comment('Observaciones adicionales del uniforme');
            });
        }

        // Verificar y crear índice con longitud específica
        $indexes = DB::select("SHOW INDEXES FROM invoices WHERE Key_name = 'invoices_invoice_file_index'");
        if (empty($indexes)) {
            // Usar SQL directo para especificar longitud del índice (100 caracteres)
            DB::statement('CREATE INDEX invoices_invoice_file_index ON invoices (invoice_file(100))');
        }
    }

    public function down(): void
    {
        // Eliminar índice si existe
        $indexes = DB::select("SHOW INDEXES FROM invoices WHERE Key_name = 'invoices_invoice_file_index'");
        if (!empty($indexes)) {
            DB::statement('DROP INDEX invoices_invoice_file_index ON invoices');
        }

        // Eliminar columnas
        Schema::table('invoices', function (Blueprint $table) {
            if (Schema::hasColumn('invoices', 'invoice_file')) {
                $table->dropColumn('invoice_file');
            }
        });

        Schema::table('uniform_stock', function (Blueprint $table) {
            if (Schema::hasColumn('uniform_stock', 'observations')) {
                $table->dropColumn('observations');
            }
        });
    }
};