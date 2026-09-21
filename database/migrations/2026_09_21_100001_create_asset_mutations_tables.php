<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Header pergeseran: satu BAST bisa memuat banyak barang dari satu ruangan ke ruangan lain.
        // Nama ruangan & PJ disimpan sebagai salinan supaya riwayat tetap terbaca walau master berubah.
        Schema::create('asset_mutations', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_bast');
            $table->date('tanggal');
            $table->foreignId('ruangan_asal_id')->nullable()->constrained('ruangans')->nullOnDelete();
            $table->string('ruangan_asal_nama');
            $table->foreignId('ruangan_tujuan_id')->nullable()->constrained('ruangans')->nullOnDelete();
            $table->string('ruangan_tujuan_nama');
            $table->string('pj_asal_nama')->nullable();
            $table->string('pj_asal_nip', 50)->nullable();
            $table->string('pj_tujuan_nama')->nullable();
            $table->string('pj_tujuan_nip', 50)->nullable();
            $table->text('keterangan')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('tanggal');
            $table->index('ruangan_asal_id');
            $table->index('ruangan_tujuan_id');
        });

        Schema::create('asset_mutation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mutation_id')->constrained('asset_mutations')->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('ruangan_asal_id')->nullable()->constrained('ruangans')->nullOnDelete();
            $table->string('ruangan_asal_nama')->nullable();
            $table->string('pj_asal_nama')->nullable();
            $table->string('pj_asal_nip', 50)->nullable();
            $table->timestamps();

            $table->unique(['mutation_id', 'asset_id']);
            $table->index('asset_id');
        });

        Schema::create('asset_mutation_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mutation_id')->constrained('asset_mutations')->cascadeOnDelete();
            $table->string('jenis_dokumen');
            $table->string('nama_asli');
            $table->string('nama_file');
            $table->string('path');
            $table->unsignedBigInteger('ukuran_bytes')->default(0);
            $table->string('mime_type')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_mutation_documents');
        Schema::dropIfExists('asset_mutation_items');
        Schema::dropIfExists('asset_mutations');
    }
};
