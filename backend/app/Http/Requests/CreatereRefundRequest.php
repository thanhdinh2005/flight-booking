<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreatereRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => 'required|string|min:10|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Please enter the reason you wish to refund your ticket.',
            'reason.min' => 'The reason is too short, please provide more details.',
        ];
    }
}
