<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->foreignId('ruangan_id')->nullable()->after('wilayah_id')->constrained('ruangans')->nullOnDelete();
            $table->index('ruangan_id');
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex(['ruangan_id']);
            $table->dropForeign(['ruangan_id']);
            $table->dropColumn('ruangan_id');
        });
    }
};
