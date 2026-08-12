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
        Schema::create('company_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')
            ->constrained()
            ->cascadeOnDelete();

            $table->string('invoice_prefix')->default('INV');
            $table->string('quotation_prefix')->default('QUO');
            $table->string('order_prefix')->default('ORD');
            $table->string('purchase_prefix')->default('PO');

            $table->unsignedInteger('invoice_next_number')->default(1);
            $table->unsignedInteger('quotation_next_number')->default(1);
            $table->unsignedInteger('order_next_number')->default(1);
            $table->unsignedInteger('purchase_next_number')->default(1);

            $table->decimal('default_tax_rate', 5, 2)->default(20.00);

            $table->timestamps();

            $table->unique('company_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_settings');
    }
};
