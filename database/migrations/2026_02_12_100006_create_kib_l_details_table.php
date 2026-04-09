<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kib_l_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->unique()->constrained('assets')->cascadeOnDelete();
            $table->smallInteger('tahun_pengadaan');
            $table->string('judul_nama', 500)->nullable();
            $table->string('pencipta')->nullable();
            $table->text('spesifikasi')->nullable();
            $table->string('kondisi', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kib_l_details');
    }
};
