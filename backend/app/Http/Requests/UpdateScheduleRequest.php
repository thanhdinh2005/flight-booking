<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleRequest extends FormRequest
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
            'departure_time' => 'sometimes|date_format:H:i:s',
            'days_of_week'   => 'sometimes|array|min:1|max:7',
            'days_of_week.*' => 'integer|between:1,7',
            'aircraft_id'    => 'sometimes|integer|exists:aircrafts,id',
            'is_active'      => 'sometimes|boolean',
        ];
    }

    public function messages() : array
    {
        return [
            'departure_time.data_format' => 'Invalid departure time',
            'days_of_week.*.between' => 'Day of week must between 1 to 7',
            'is_active.boolean' => 'Invalid field is_active',
        ];
    }
}
