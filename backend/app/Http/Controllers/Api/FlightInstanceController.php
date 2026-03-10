<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\CreateManualFlightInstanceUseCase;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateManualFlightRequest;
use App\Http\Response\ApiResponse;
use OpenApi\Annotations as OA;

class FlightInstanceController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/flights/manual",
     *     summary="Create manual flight instance",
     *     description="Create a flight instance manually without using schedule",
     *     tags={"Flight"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CreateManualFlightRequest")
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="Flight instance created successfully",
     *
     *         @OA\JsonContent(
     *             allOf={
     *                 @OA\Schema(ref="#/components/schemas/ApiResponse")
     *             }
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=422,
     *         description="Validation error"
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function storeManualInstance(CreateManualFlightInstanceUseCase $usecase, CreateManualFlightRequest $request) {
        $admin = $request->user();
        $ipAddress = $request->ip();

        $departureString = $request->get('departure_date') . ' ' . $request->get('departure_time');

        $instance = $usecase->execute(
            routeId: $request->get('route_id'),
            aircraftId: $request->get('aircraft_id'),
            flightNumber: $request->get('flight_number'),
            departureTime: $departureString,
            adminId: $admin->id,
            ipAddress: $ipAddress
        );

        return ApiResponse::success(
            $instance,
            message: "Tạo mới thành công",
            status: 201
        );
    }

    
}
