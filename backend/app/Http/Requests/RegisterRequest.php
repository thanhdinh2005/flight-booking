<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'min:6', 'max:20'],
            'firstName' => ['required', 'max:20', 'min:1'],
            'lastName' => ['required', 'max:20', 'min:1']
        ];
    }

    public function messages()
    {
        return [
            'email.required' => 'Email is required',
            'email.email' => 'Invalid email',
            'password.required' => 'Password is required',
            'password.max' => 'Password cannot exceed 20 characters',
            'password.min' => 'Password cannot less than 6 characters',
            'firstName.max' => 'First name cannot exceed 20 characters',
            'lastName.max' => 'Last name cannot exceed 20 characters',
            'firstName.min' => 'First name cannot less than 1 character',
            'lastName.min' => 'Last name cannot less than 1 character',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationException($validator);   
    }
}
