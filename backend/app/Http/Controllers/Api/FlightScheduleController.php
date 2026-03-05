<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\CreateFlightScheduleUseCase;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateScheduleRequest;
use App\Http\Response\ApiResponse;

class FlightScheduleController extends Controller
{
    public function store(CreateScheduleRequest $request) {
        $response = app(CreateFlightScheduleUseCase::class) -> execute(
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
}
