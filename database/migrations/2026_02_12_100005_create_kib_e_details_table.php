<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kib_e_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->unique()->constrained('assets')->cascadeOnDelete();
            $table->string('judul_pencipta')->nullable();
            $table->text('spesifikasi')->nullable();
            $table->string('asal_daerah')->nullable();
            $table->string('pencipta')->nullable();
            $table->string('bahan')->nullable();
            $table->string('jenis')->nullable();
            $table->string('ukuran')->nullable();
            $table->integer('jumlah')->default(1);
            $table->smallInteger('tahun_cetak');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kib_e_details');
    }
};
