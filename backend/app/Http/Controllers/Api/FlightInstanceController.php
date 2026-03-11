<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\CreateManualFlightInstanceUseCase;
use App\Exceptions\EntityNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateManualFlightRequest;
use App\Http\Response\ApiResponse;
use App\Http\Response\PaginationResponse;
use App\Models\FlightInstance;
use Illuminate\Http\Request;
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

    public function getAll(Request $request) {
        $perPage = $request->input('per_page', 10);

        $paginator = FlightInstance::with(['route', 'aircraft'])->paginate($perPage);

        $result = PaginationResponse::fromPaginator(
            $paginator,
            fn ($flight) => [
                'id' => $flight->id,
                'flight_number' => $flight->flight_number,
                'departure_date' => $flight->departure_date,

                'route' => [
                    'id' => $flight->route->id,
                    'from' => $flight->route->origin->city,
                    'to' => $flight->route->destination->city,
                ],

                'aircraft' => [
                    'id' => $flight->aircraft->id,
                    'model' => $flight->aircraft->model,
                    'registration_number' => $flight->aircraft->registration_number
                ],

                'std' => $flight->std,
                'sta' => $flight->sta,
                'etd' => $flight->eta,
                'etd' => $flight->etd,
                'status' => $flight->status,
                'created_at' => $flight->creatd_at,
                'updated_at' => $flight->updated_at
            ]
        );

        return ApiResponse::success(
            message: 'Lấy lịch trình thành công',
            data: $result->data,
            meta: $result->meta
        );
    }

    public function getById(int $id) {
        $flight = FlightInstance::find($id);

        if (!$flight) throw new EntityNotFoundException("Không tìm thấy chuyến bay");

        $response = [
            'id' => $flight->id,
            'flight_number' => $flight->flight_number,
            'departure_date' => $flight->departure_date,

            'route' => [
                'id' => $flight->route->id,
                'from' => $flight->route->origin->city,
                'to' => $flight->route->destination->city,
            ],

            'aircraft' => [
                'id' => $flight->aircraft->id,
                'model' => $flight->aircraft->model,
                'registration_number' => $flight->aircraft->registration_number
            ],

            'std' => $flight->std,
            'sta' => $flight->sta,
            'etd' => $flight->eta,
            'etd' => $flight->etd,
            'status' => $flight->status,
            'created_at' => $flight->creatd_at,
            'updated_at' => $flight->updated_at
        ];

        return ApiResponse::success(data: $response);
    }
    
    public function filterFlight(Request $request) {
        $filters = $request->all();

        $perPage = $request->input('per_page', 10);

        $paginator = FlightInstance::query()
            ->with([
                'route.origin',
                'route.destination',
                'aircraft'
            ])
            ->filter($filters)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $result = PaginationResponse::fromPaginator(
            $paginator,
            fn ($flight) => [
                'id' => $flight->id,
                'flight_number' => $flight->flight_number,
                'departure_date' => $flight->departure_date,

                'route' => [
                    'id' => $flight->route->id,
                    'from' => $flight->route->origin->city,
                    'to' => $flight->route->destination->city,
                ],

                'aircraft' => [
                    'id' => $flight->aircraft->id,
                    'model' => $flight->aircraft->model,
                    'registration_number' => $flight->aircraft->registration_number
                ],

                'std' => $flight->std,
                'sta' => $flight->sta,
                'etd' => $flight->eta,
                'etd' => $flight->etd,
                'status' => $flight->status,
                'created_at' => $flight->creatd_at,
                'updated_at' => $flight->updated_at
            ]
        );
        
        return ApiResponse::success(
            message: 'Lấy lịch trình thành công',
            data: $result->data,
            meta: $result->meta
        );
    }
}
