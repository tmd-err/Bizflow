<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'reference' => ['required', 'string', 'max:100', 'unique:stock_adjustments,reference'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.system_quantity' => ['required', 'numeric', 'min:0'],
            'items.*.actual_quantity' => ['required', 'numeric', 'min:0'],
        ];
    }
}