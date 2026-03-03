<?php

namespace App\Http\Requests;

use App\Http\Response\ApiResponse;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\ValidationException;

class UpdateProfileRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => 'sometimes|max:50|string',
            'phone_number' => 'sometimes|max:20|string',
        ];
    }

    public function messages()
    {
        return [
            'full_name.max' => 'Full name cannot exceed 50 characters',
            'phone_number' => 'Phone number cannot exceed 20 characters'
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationException($validator);
    }
}
