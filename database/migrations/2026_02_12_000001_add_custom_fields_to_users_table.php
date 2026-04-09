<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nip', 50)->nullable()->after('name');
            $table->string('role', 20)->default('staff')->after('nip');
            $table->string('telepon', 20)->nullable()->after('email');
            $table->boolean('is_active')->default(true)->after('telepon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nip', 'role', 'telepon', 'is_active']);
        });
    }
};
