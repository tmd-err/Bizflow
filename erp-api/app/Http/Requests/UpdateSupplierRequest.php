<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'code'      => ['sometimes', 'required', 'string', 'max:50', 'unique:suppliers,code,' . $this->route('supplier')->id],
            'name'      => ['sometimes', 'required', 'string', 'max:255'],
            'email'     => ['nullable', 'email', 'max:255'],
            'phone'     => ['nullable', 'string', 'max:50'],
            'address'   => ['nullable', 'string', 'max:500'],
            'city'      => ['nullable', 'string', 'max:100'],
            'country'   => ['nullable', 'string', 'max:100'],
            'tax_number'=> ['nullable', 'string', 'max:50'],
            'notes'     => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}