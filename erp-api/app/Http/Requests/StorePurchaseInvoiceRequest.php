<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePurchaseInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            "supplier_id"        => ["required", "exists:suppliers,id"],
            "purchase_order_id"  => ["nullable", "exists:purchase_orders,id"],
            "invoice_number"     => ["required", "string", "max:100", "unique:purchase_invoices,invoice_number"],
            "invoice_date"       => ["required", "date"],
            "due_date"           => ["nullable", "date", "after_or_equal:invoice_date"],
            "notes"              => ["nullable", "string"],
            "items"              => ["required", "array", "min:1"],
            "items.*.description"          => ["required", "string", "max:255"],
            "items.*.quantity"             => ["required", "numeric", "min:0.01"],
            "items.*.unit_price"           => ["required", "numeric", "min:0"],
            "items.*.tax_rate"             => ["nullable", "numeric", "min:0", "max:100"],
        ];
    }
}