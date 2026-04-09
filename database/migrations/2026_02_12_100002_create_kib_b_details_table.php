<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kib_b_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->unique()->constrained('assets')->cascadeOnDelete();
            $table->string('merk_type')->nullable();
            $table->string('ukuran_cc', 100)->nullable();
            $table->string('bahan', 100)->nullable();
            $table->smallInteger('tahun_pembelian');
            $table->string('nomor_pabrik', 100)->nullable();
            $table->string('nomor_rangka', 100)->nullable();
            $table->string('nomor_mesin', 100)->nullable();
            $table->string('nomor_polisi', 20)->nullable();
            $table->string('nomor_bpkb', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kib_b_details');
    }
};
