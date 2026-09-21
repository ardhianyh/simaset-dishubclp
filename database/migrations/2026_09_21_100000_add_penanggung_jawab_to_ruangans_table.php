<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ruangans', function (Blueprint $table) {
            $table->string('pj_nama')->nullable()->after('deskripsi');
            $table->string('pj_nip', 50)->nullable()->after('pj_nama');
        });
    }

    public function down(): void
    {
        Schema::table('ruangans', function (Blueprint $table) {
            $table->dropColumn(['pj_nama', 'pj_nip']);
        });
    }
};
