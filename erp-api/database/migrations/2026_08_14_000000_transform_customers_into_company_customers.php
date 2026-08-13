<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->foreignId('company_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->string('name')->nullable()->after('company_id');
            $table->string('email')->nullable()->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->string('address')->nullable()->after('phone');
            $table->string('city')->nullable()->after('address');
            $table->string('country')->nullable()->after('city');
            $table->string('tax_number')->nullable()->after('country');
            $table->text('notes')->nullable()->after('tax_number');
            $table->boolean('is_active')->default(true)->after('notes');
        });

        DB::table('customers')->orderBy('id')->each(function (object $customer): void {
            $user = DB::table('users')->where('id', $customer->user_id)->first();

            if ($user?->company_id) {
                DB::table('customers')->where('id', $customer->id)->update([
                    'company_id' => $user->company_id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]);
            }
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            $table->string('name')->nullable(false)->change();
            $table->foreignId('company_id')->nullable(false)->change();
            $table->unique(['company_id', 'email']);
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropUnique(['company_id', 'email']);
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->dropConstrainedForeignId('company_id');
            $table->dropColumn([
                'name', 'email', 'phone', 'address', 'city', 'country', 'tax_number',
                'notes', 'is_active',
            ]);
        });
    }
};
