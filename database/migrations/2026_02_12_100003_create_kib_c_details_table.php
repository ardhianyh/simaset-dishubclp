<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kib_c_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->unique()->constrained('assets')->cascadeOnDelete();
            $table->enum('kondisi', ['Baik', 'Kurang Baik', 'Rusak Berat']);
            $table->boolean('bertingkat')->default(false);
            $table->boolean('beton')->default(false);
            $table->decimal('luas_lantai_m2', 12, 2)->nullable();
            $table->text('alamat');
            $table->date('dokumen_tanggal')->nullable();
            $table->string('dokumen_nomor')->nullable();
            $table->string('status_tanah', 100)->nullable();
            $table->string('nomor_kode_tanah', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kib_c_details');
    }
};
