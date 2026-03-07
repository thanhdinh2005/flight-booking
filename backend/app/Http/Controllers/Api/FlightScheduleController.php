<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\CreateFlightScheduleUseCase;
use App\Application\UseCases\PhaseOutScheduleUseCase;
use App\Application\UseCases\ReactiveScheduleUseCase;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateScheduleRequest;
use App\Http\Response\ApiResponse;
use Illuminate\Http\Request;

class FlightScheduleController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/admin/schedules",
     *     summary="Create flight schedule",
     *     tags={"Schedule"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CreateScheduleRequest")
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Schedule created successfully",
     *
     *         @OA\JsonContent(
     *             allOf={
     *                 @OA\Schema(ref="#/components/schemas/ApiResponse"),
     *                 @OA\Schema(
     *                     @OA\Property(
     *                         property="data",
     *                         ref="#/components/schemas/ScheduleResponse"
     *                     )
     *                 )
     *             }
     *         )
     *     )
     * )
     */
    public function store(Request $rq ,CreateScheduleRequest $request, CreateFlightScheduleUseCase $usecase) {
        $admin = $request->user();
    
        $response = $usecase -> execute(
            adminId: $admin,
            ipAddress: $rq->ip(),
            route_id: $request->integer('route_id'),
            flight_number: $request->string('flight_number'),
            departure_time: $request->string('departure_time'),
            days_of_week: $request->array('days_of_week'),
            aircraft_id: $request->integer('aircraft_id')
        );

        return ApiResponse::success(
            $response,
            'Created',
            201
        );
    }

    /**
     * @OA\Post(
     *     path="/api/admin/schedules/{scheduleId}/phase-out",
     *     summary="Deactivate flight schedule",
     *     tags={"Schedule"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="scheduleId",
     *         in="path",
     *         required=true,
     *         description="Schedule ID",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Schedule phased out successfully",
     *
     *         @OA\JsonContent(ref="#/components/schemas/ApiResponse")
     *     )
     * )
     */
    public function phaseOutSchedule(int $scheduleId, Request $request, PhaseOutScheduleUseCase $usecase) {
        $admin = $request->user();

        $usecase->execute(
            $scheduleId,
            $admin->id,
            $request->ip()
        );

        return ApiResponse::success(message: "Phase out schedule successfully");
    }

    /**
     * @OA\Post(
     *     path="/api/admin/schedules/{scheduleId}/reactivate",
     *     summary="Reactivate flight schedule",
     *     tags={"Schedule"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Parameter(
     *         name="scheduleId",
     *         in="path",
     *         required=true,
     *         description="Schedule ID",
     *         @OA\Schema(type="integer")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Schedule reactivated successfully",
     *
     *         @OA\JsonContent(ref="#/components/schemas/ApiResponse")
     *     )
     * )
     */
    public function reactivateSchedule(
        int $scheduleId,
        Request $request,
        ReactiveScheduleUseCase $usecase
    ) {
        $admin = $request->user();

        $usecase->execute(
            $scheduleId,
            $admin->id,
            $request->ip()
        );

        return ApiResponse::success(message: "Schedule reactivated successfully");
    }
}
