<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

/**
 * @OA\Schema(
 *     schema="UpdateProfileRequest",
 *     type="object",
 *     title="Update Profile Request",
 *
 *     @OA\Property(
 *         property="full_name",
 *         type="string",
 *         maxLength=50,
 *         example="Nguyen Van A",
 *         description="User full name"
 *     ),
 *
 *     @OA\Property(
 *         property="phone_number",
 *         type="string",
 *         maxLength=20,
 *         example="0987654321",
 *         description="User phone number"
 *     )
 * )
 */
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
