<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'label'     => ['nullable', 'string', 'max:100'],
            'address'   => ['required', 'string', 'max:500'],
            'city'      => ['nullable', 'string', 'max:100'],
            'country'   => ['nullable', 'string', 'max:100'],
            'phone'     => ['nullable', 'string', 'max:50'],
            'email'     => ['nullable', 'email', 'max:255'],
            'is_default'=> ['nullable', 'boolean'],
        ];
    }
}