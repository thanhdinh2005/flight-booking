<?php

namespace App\Http\Response;

use App\Models\FlightSchedule;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="ScheduleResponse",
 *     type="object",
 *     title="Schedule Response",
 *     required={
 *         "id",
 *         "route_id",
 *         "flight_number",
 *         "departure_time",
 *         "days_of_week",
 *         "aircraft_id",
 *         "is_active",
 *         "created_at",
 *         "updated_at"
 *     },
 *
 *     @OA\Property(
 *         property="id",
 *         type="integer",
 *         example=1
 *     ),
 *
 *     @OA\Property(
 *         property="route_id",
 *         type="integer",
 *         example=5
 *     ),
 *
 *     @OA\Property(
 *         property="flight_number",
 *         type="string",
 *         example="VN123"
 *     ),
 *
 *     @OA\Property(
 *         property="departure_time",
 *         type="string",
 *         format="time",
 *         example="08:30:00"
 *     ),
 *
 *     @OA\Property(
 *         property="days_of_week",
 *         type="array",
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
 *         example=2
 *     ),
 *
 *     @OA\Property(
 *         property="is_active",
 *         type="boolean",
 *         example=true
 *     ),
 *
 *     @OA\Property(
 *         property="created_at",
 *         type="string",
 *         format="date-time",
 *         example="2026-03-07T10:00:00Z"
 *     ),
 *
 *     @OA\Property(
 *         property="updated_at",
 *         type="string",
 *         format="date-time",
 *         example="2026-03-07T10:00:00Z"
 *     )
 * )
 */
final class ScheduleResponse 
{
public function __construct(
        public int $id,
        public int $route_id,
        public string $flight_number,
        public string $departure_time,
        public array $days_of_week,
        public int $aircraft_id,
        public bool $is_active,
        public string $created_at,
        public string $updated_at,
    ) {}

    public static function fromModel(FlightSchedule $schedule): self
    {
        return new self(
            id: $schedule->id,
            route_id: $schedule->route_id,
            flight_number: $schedule->flight_number,
            departure_time: $schedule->departure_time,
            days_of_week: $schedule->days_of_week,
            aircraft_id: $schedule->aircraft_id,
            is_active: $schedule->is_active,
            created_at: $schedule->created_at->toIso8601String(),
            updated_at: $schedule->updated_at->toIso8601String(),
        );
    }
}