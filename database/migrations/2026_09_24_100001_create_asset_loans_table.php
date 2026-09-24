<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Peminjaman sementara: barang tetap tercatat di ruangan & PJ asalnya, hanya dicatat siapa yang memakai.
        // Nama ruangan disalin supaya riwayat tetap terbaca walau master berubah.
        Schema::create('asset_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('ruangan_asal_id')->nullable()->constrained('ruangans')->nullOnDelete();
            $table->string('ruangan_asal_nama')->nullable();
            $table->string('peminjam_nama');
            $table->string('peminjam_nip', 50)->nullable();
            $table->foreignId('peminjam_ruangan_id')->nullable()->constrained('ruangans')->nullOnDelete();
            $table->string('peminjam_ruangan_nama');
            $table->text('keperluan');
            $table->dateTime('dipinjam_pada');
            $table->dateTime('rencana_kembali')->nullable();
            $table->dateTime('dikembalikan_pada')->nullable();
            $table->text('catatan_kembali')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('returned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('asset_id');
            $table->index('dipinjam_pada');
            $table->index('dikembalikan_pada');
            $table->index('peminjam_ruangan_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_loans');
    }
};
