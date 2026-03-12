<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="CreateManualFlightRequest",
 *     type="object",
 *     required={
 *         "route_id",
 *         "aircraft_id",
 *         "flight_number",
 *         "departure_date",
 *         "departure_time"
 *     },
 *
 *     @OA\Property(
 *         property="route_id",
 *         type="integer",
 *         example=5,
 *         description="Route ID"
 *     ),
 *
 *     @OA\Property(
 *         property="aircraft_id",
 *         type="integer",
 *         example=2,
 *         description="Aircraft ID"
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
 *         property="departure_date",
 *         type="string",
 *         format="date",
 *         example="2026-04-01",
 *         description="Flight departure date"
 *     ),
 *
 *     @OA\Property(
 *         property="departure_time",
 *         type="string",
 *         example="08:30",
 *         description="Flight departure time (HH:mm)"
 *     )
 * )
 */
class CreateManualFlightRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'route_id'       => 'required|exists:routes,id',
            'aircraft_id'    => 'required|exists:aircrafts,id',
            'flight_number'  => 'required|string|max:10',
            'departure_date' => 'required|date|after_or_equal:today',
            'departure_time' => 'required|date_format:H:i',
        ];
    }
}
