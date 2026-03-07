<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @OA\Schema(
 *     schema="CreateScheduleRequest",
 *     type="object",
 *     required={"route_id","flight_number","departure_time","days_of_week","aircraft_id"},
 * 
 *     @OA\Property(
 *         property="route_id",
 *         type="integer",
 *         example=1,
 *         description="ID of route"
 *     ),
 * 
 *     @OA\Property(
 *         property="flight_number",
 *         type="string",
 *         maxLength=10,
 *         example="VN123",
 *         description="Flight number"
 *     ),
 * 
 *     @OA\Property(
 *         property="departure_time",
 *         type="string",
 *         format="time",
 *         example="08:30:00",
 *         description="Departure time (H:i:s)"
 *     ),
 * 
 *     @OA\Property(
 *         property="days_of_week",
 *         type="array",
 *         description="Days of week (1=Monday ... 7=Sunday)",
 *         @OA\Items(
 *             type="integer",
 *             example=1
 *         ),
 *         example={1,3,5}
 *     ),
 * 
 *     @OA\Property(
 *         property="aircraft_id",
 *         type="integer",
 *         example=2,
 *         description="Aircraft ID"
 *     )
 * )
 */
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
