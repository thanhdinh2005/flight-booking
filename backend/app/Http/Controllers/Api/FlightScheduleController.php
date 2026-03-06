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

    public function phaseOutSchedule(int $scheduleId, Request $request, PhaseOutScheduleUseCase $usecase) {
        $admin = $request->user();

        $usecase->execute(
            $scheduleId,
            $admin->id,
            $request->ip()
        );

        return ApiResponse::success(message: "Phase out schedule successfully");
    }

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
