<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('role_user')
            ->whereNull('user_id')
            ->orWhereNull('role_id')
            ->delete();

        Schema::table('role_user', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->unsignedBigInteger('role_id')->nullable(false)->change();
            $table->unique(['user_id', 'role_id']);
        });
    }

    public function down(): void
    {
        Schema::table('role_user', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'role_id']);
            $table->unsignedBigInteger('user_id')->nullable()->change();
            $table->unsignedBigInteger('role_id')->nullable()->change();
        });
    }
};
