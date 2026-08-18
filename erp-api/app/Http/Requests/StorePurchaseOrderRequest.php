<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            "supplier_id"  => ["required", "exists:suppliers,id"],
            "warehouse_id" => ["required", "exists:warehouses,id"],
            "reference"    => ["required", "string", "max:100", "unique:purchase_orders,reference"],
            "order_date"   => ["nullable", "date"],
            "expected_date"=> ["nullable", "date", "after_or_equal:order_date"],
            "notes"        => ["nullable", "string"],
            "status"       => ["nullable", Rule::in(["draft", "ordered", "partially_received", "received", "cancelled"])],
            "items"        => ["required", "array", "min:1"],
            "items.*.product_id"   => ["required", "exists:products,id"],
            "items.*.quantity"     => ["required", "numeric", "min:0.01"],
            "items.*.unit_price"   => ["required", "numeric", "min:0"],
            "items.*.tax_rate"     => ["nullable", "numeric", "min:0", "max:100"],
        ];
    }
}