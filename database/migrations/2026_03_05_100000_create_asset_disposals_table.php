<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_disposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->unique()->constrained()->cascadeOnDelete();
            $table->enum('jenis', ['dihapus', 'dikembalikan', 'dihibahkan']);
            $table->text('alasan')->nullable();
            $table->string('nomor_sk')->nullable();
            $table->date('tanggal');
            $table->foreignId('disposed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('asset_disposal_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disposal_id')->constrained('asset_disposals')->cascadeOnDelete();
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
        Schema::dropIfExists('asset_disposal_documents');
        Schema::dropIfExists('asset_disposals');
    }
};
