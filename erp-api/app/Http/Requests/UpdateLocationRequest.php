<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $location = $this->route('location');

        return [
            'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('warehouse_locations', 'code')->where(fn ($query) => $query->where('warehouse_id', $this->route('warehouse')?->id ?? $location?->warehouse_id))->ignore($location?->id)],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
        ];
    }
}