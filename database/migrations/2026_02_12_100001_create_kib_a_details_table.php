<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kib_a_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->unique()->constrained('assets')->cascadeOnDelete();
            $table->decimal('luas_m2', 12, 2);
            $table->smallInteger('tahun_pengadaan');
            $table->text('alamat');
            $table->string('hak_tanah', 100)->nullable();
            $table->date('sertifikat_tanggal')->nullable();
            $table->string('sertifikat_nomor', 100)->nullable();
            $table->string('penggunaan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kib_a_details');
    }
};
