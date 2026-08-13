<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendEmailVerificationCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()->id),
                Rule::notIn([$this->user()->email]),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.not_in' => 'The new email must be different from your current email.',
        ];
    }
}
