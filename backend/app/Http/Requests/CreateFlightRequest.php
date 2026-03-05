<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateFlightRequest extends FormRequest
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
            'aircraft_id'    => 'required|integer|exists:aircrafts,id',
            'flight_number'  => 'required|string|max:10',
            'departure_date' => 'required|date',
            'std'            => 'required|date', //Scheduled Time of Departure
            'sta'            => 'required|date|after:std',
        ];
    }
}
