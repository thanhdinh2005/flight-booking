<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="CreateUserRequest",
 *     type="object",
 *     required={"email","password","first_name","last_name","phone_number"},
 *
 *     @OA\Property(property="email", type="string", format="email", example="user@gmail.com"),
 *     @OA\Property(property="password", type="string", example="123456"),
 *     @OA\Property(property="first_name", type="string", example="Phuc"),
 *     @OA\Property(property="last_name", type="string", example="Dinh"),
 *     @OA\Property(property="phone_number", type="string", example="0987654321"),
 *     @OA\Property(property="role", type="string", example="customer")
 * )
 */
class CreateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'max:20'],
            'first_name' => ['required', 'string', 'max:50'],
            'last_name' => ['required', 'string', 'max:50'],
            'phone_number' => ['required', 'string', 'regex:/^([0-9\s\-\+\(\)]*)$/', 'min:10'],
            'role' => ['required', 'string']
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new ValidationException($validator);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim($this->email)),
            'first_name' => strip_tags(trim($this->first_name)),
            'last_name' => strip_tags(trim($this->last_name)),
        ]);
    }
}
