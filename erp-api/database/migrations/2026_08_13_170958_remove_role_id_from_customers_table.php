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
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropUnique(['role_id', 'user_id']);
            $table->dropColumn('role_id');
        });
    }
    
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('role_id')
                ->constrained('roles')
                ->cascadeOnDelete();
    
            $table->unique(['role_id', 'user_id']);
        });
    }
};
