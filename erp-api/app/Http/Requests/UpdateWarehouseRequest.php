<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWarehouseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $warehouse = $this->route('warehouse');

        return [
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('warehouses', 'code')->where(fn ($query) => $query->where('company_id', $this->user()->company_id))->ignore($warehouse?->id)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}