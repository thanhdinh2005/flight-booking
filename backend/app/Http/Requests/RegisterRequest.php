<?php

namespace App\Http\Requests;

use App\Http\Response\ApiResponse;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],

            'password' => ['required', 'string', 'min:6', 'max:20'],

            'first_name' => ['required', 'string', 'max:20'],

            'last_name' => ['required', 'string', 'max:20'],

            'phone_number' => ['required', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email is required',
            'email.email' => 'Invalid email format',
            'email.unique' => 'Email already exists',

            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 6 characters',
            'password.max' => 'Password cannot exceed 20 characters',

            'first_name.required' => 'First name is required',
            'first_name.max' => 'First name cannot exceed 20 characters',

            'last_name.required' => 'Last name is required',
            'last_name.max' => 'Last name cannot exceed 20 characters',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            ApiResponse::errorList(
                $validator->errors()->all()
            )->toResponse(400)
        ); 
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim($this->email)),
        ]);
    }
}
