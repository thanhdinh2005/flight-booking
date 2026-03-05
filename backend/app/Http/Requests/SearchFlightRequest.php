<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchFlightRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'origin'         => 'required|string|exists:airports,code', // Dùng mã HAN, SGN
            'destination'    => 'required|string|exists:airports,code',
            'departure_date' => 'required|date',
            'return_date'    => 'nullable|date|after_or_equal:departure_date', // Ngày về phải sau ngày đi
            'cabin_class'    => 'nullable|string|in:ECONOMY,BUSINESS',
            'adults'         => 'nullable|integer|min:1',
            'children'       => 'nullable|integer|min:0',
        ];
    }
}
