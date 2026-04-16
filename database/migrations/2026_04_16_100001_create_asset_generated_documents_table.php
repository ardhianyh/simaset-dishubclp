<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_generated_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->string('jenis'); // 'pakta_integritas' or 'bast'
            $table->string('path');
            $table->string('filename');
            $table->json('metadata')->nullable(); // stores form data used to generate
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['asset_id', 'jenis']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_generated_documents');
    }
};
