<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Pergeseran bisa berupa pindah ruangan, atau hanya ganti penanggung jawab di ruangan yang sama.
        Schema::table('asset_mutations', function (Blueprint $table) {
            $table->string('jenis', 20)->default('pindah_ruangan')->after('tanggal');
        });
    }

    public function down(): void
    {
        Schema::table('asset_mutations', function (Blueprint $table) {
            $table->dropColumn('jenis');
        });
    }
};
