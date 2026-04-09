<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->enum('kib_type', ['A', 'B', 'C', 'D', 'E', 'L']);
            $table->string('nama_barang', 500);
            $table->string('kode_barang', 50);
            $table->string('nomor_register', 50);
            $table->foreignId('wilayah_id')->nullable()->constrained('wilayahs')->nullOnDelete();
            $table->string('pj_nama');
            $table->string('pj_nip', 50)->nullable();
            $table->string('pj_telepon', 20)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('asal_usul', ['Pembelian', 'Hibah', 'Sumbangan', 'Tukar Menukar', 'Lainnya']);
            $table->decimal('harga', 15, 2)->default(0);
            $table->text('keterangan')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->softDeletes();
            $table->timestamps();

            $table->index('kib_type');
            $table->index('wilayah_id');
            $table->index('kode_barang');
            $table->index('pj_nama');
            $table->index('deleted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
