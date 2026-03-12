<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserFilterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules()
    {
        return [
            'phone' => 'nullable|string',
            'email' => 'nullable|string',
            'full_name' => 'nullable|string',
            'role' => 'nullable|string',
            'created_from' => 'nullable|date',
            'created_to' => 'nullable|date',
            'disabled' => 'nullable|boolean',
            'page' => 'nullable|integer',
            'limit' => 'nullable|integer'
        ];
    }
}
