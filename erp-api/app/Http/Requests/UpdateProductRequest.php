<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'sku' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('products', 'sku')->where(fn ($query) => $query->where('company_id', $this->user()->company_id))->ignore($product?->id)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'unit' => ['sometimes', 'required', 'string', 'max:50'],
            // Keep this name aligned with the products table and the create request.
            // Using purchase_price here caused cost_price to be silently ignored by
            // the update endpoint because it was never part of validated().
            'cost_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'selling_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp,gif', 'max:5120'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
