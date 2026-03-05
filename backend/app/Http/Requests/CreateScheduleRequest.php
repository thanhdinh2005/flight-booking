<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateScheduleRequest extends FormRequest
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
            'route_id'       => 'required|integer|exists:routes,id',
            'flight_number'  => 'required|string|max:10',
            'departure_time' => 'required|date_format:H:i:s',
            'days_of_week'   => 'required|array|min:1|max:7',
            'days_of_week.*' => 'integer|between:1,7', // From Monday(1) to Sunday(7)
            'aircraft_id'    => 'required|integer|exists:aircrafts,id',
        ];
    }

    public function messages(): array
    {
        return [
            'route_id.exists' => 'Route does not exist in system',
            'aircraft_id.exists' => 'Aircraft does not exist in system',
            'days_of_week.*.between' => 'Day of week must between 1 to 7',
        ];
    }
}
