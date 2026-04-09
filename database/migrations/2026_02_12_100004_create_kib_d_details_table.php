<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kib_d_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->unique()->constrained('assets')->cascadeOnDelete();
            $table->string('konstruksi')->nullable();
            $table->decimal('panjang_km', 10, 3)->nullable();
            $table->decimal('lebar_m', 10, 3)->nullable();
            $table->decimal('luas_m2', 12, 2)->nullable();
            $table->text('alamat');
            $table->date('dokumen_tanggal')->nullable();
            $table->string('dokumen_nomor')->nullable();
            $table->string('status_tanah', 100)->nullable();
            $table->string('nomor_kode_tanah', 100)->nullable();
            $table->enum('kondisi', ['Baik', 'Kurang Baik', 'Rusak Berat'])->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kib_d_details');
    }
};
