<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            "order_date"   => ["nullable", "date"],
            "expected_date"=> ["nullable", "date", "after_or_equal:order_date"],
            "notes"        => ["nullable", "string"],
            "status"       => ["nullable", Rule::in(["draft", "ordered", "partially_received", "received", "cancelled"])],
        ];
    }
}