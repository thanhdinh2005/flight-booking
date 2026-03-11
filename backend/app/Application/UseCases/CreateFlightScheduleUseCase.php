<?php

namespace App\Application\UseCases;

use App\Application\Command\AuditLog\CreateAuditLogCommand;
use App\Application\Command\FlightSchedule\GenerateFlightInstancesCommand;
use App\Exceptions\BusinessException;
use App\Exceptions\EntityNotFoundException;
use App\Http\Response\ScheduleResponse;
use App\Models\Aircraft;
use App\Models\FlightSchedule;
use Illuminate\Support\Facades\DB;

final class CreateFlightScheduleUseCase
{
    public function __construct(
        private GenerateFlightInstancesCommand $generateFlight,
        private CreateAuditLogCommand $cmd
    )
    {}

    public function execute(
        int $adminId,
        string $ipAddress,
        int $route_id,
        string $flight_number,
        string $departure_time,
        array $days_of_week,
        int $aircraft_id
    ): ScheduleResponse {

        return DB::transaction(function () use (
            $route_id,
            $flight_number,
            $departure_time,
            $days_of_week,
            $aircraft_id,
            $adminId,
            $ipAddress,
        ) {

            $this->ensureNoRouteConflict(
                $route_id,
                $departure_time,
                $days_of_week
            );

            $this->ensureAircraftAvailable(
                $aircraft_id,
                $departure_time,
                $days_of_week
            );

            $schedule = FlightSchedule::create([
                'route_id' => $route_id,
                'flight_number' => $flight_number,
                'departure_time' => $departure_time,
                'days_of_week' => $days_of_week,
                'aircraft_id' => $aircraft_id,
                'is_active' => true
            ]);

            $this->generateFlight->execute($schedule->id);
            $this->cmd->execute(
                userId: $adminId,
                action: 'CREATE_NEW_SCHEDULE',
                targetTable: 'flight_schedules',
                targetId: $schedule->id,
                changes: [],
                ipAddress: $ipAddress
            );
            return ScheduleResponse::fromModel($schedule);
        });
    }

    private function ensureNoRouteConflict(
        int $routeId,
        string $time,
        array $days
    ): void {

        $schedules = FlightSchedule::sameRouteAndTime($routeId, $time)->get();

        foreach ($schedules as $schedule) {

            if (array_intersect($schedule->days_of_week, $days)) {
                throw new BusinessException(
                    'Lịch trình xung đột: đã có máy bay hoạt động trong tuyến đường.'
                );
            }
        }
    }

    private function ensureAircraftAvailable(
        int $aircraftId,
        string $time,
        array $days
    ): void {

        $aircraft = Aircraft::find($aircraftId);
        if (!$aircraft) throw new EntityNotFoundException("Không tìm thấy máy bay");
        if (!$aircraft->status === "ACTIVE") throw new BusinessException("Máy bay đang bảo trì");

        $schedules = FlightSchedule::sameAircraftAndTime($aircraftId, $time)->get();

        foreach ($schedules as $schedule) {

            if (array_intersect($schedule->days_of_week, $days)) {
                throw new BusinessException(
                    'Trùng lịch máy bay'
                );
            }
        }
    }
}