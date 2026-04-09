<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->enum('jenis_dokumen', ['BAST', 'Foto', 'Sertifikat', 'SK', 'Lainnya']);
            $table->string('nama_asli');
            $table->string('nama_file');
            $table->string('path', 500);
            $table->integer('ukuran_bytes');
            $table->string('mime_type', 100);
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('asset_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_documents');
    }
};
