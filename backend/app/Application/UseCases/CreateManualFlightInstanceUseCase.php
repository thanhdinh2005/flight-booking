<?php

namespace App\Application\UseCases;

use App\Application\Command\AuditLog\CreateAuditLogCommand;
use App\Application\Command\FlightInstance\CreateFlightInstanceCommand;
use App\Application\Command\SeatInventory\CreateSeatInventoryCommand as SeatInventoryCreateSeatInventoryCommand;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

final class CreateManualFlightInstanceUseCase
{
    public function __construct(
        private CreateFlightInstanceCommand $createInstanceCommand,
        private SeatInventoryCreateSeatInventoryCommand $createInventoryCmd,
        private CreateAuditLogCommand $auditCmd,
    ) {}

    public function execute(
        int $routeId,
        int $aircraftId,
        string $flightNumber,
        string $departureTime,
        int $adminId,
        string $ipAddress
    ) {

        $departure = Carbon::parse($departureTime);

        DB::beginTransaction();

        try {
            $instance = $this->createInstanceCommand->execute(
                $routeId,
                $aircraftId,
                $flightNumber,
                $departure,
                null
            );

            $this->createInventoryCmd->execute($instance->id);

            $this->auditCmd->execute(
                userId: $adminId,
                action: "CREATE_MANUAL_FLIGHT_INSTANCES",
                targetTable: "flight_instances",
                targetId: $instance->id,
                changes: null,
                ipAddress: $ipAddress
            );
            DB::commit();

            return $instance;
        } catch (Throwable $e) {
            DB::rollBack();
            throw $e;
        }

    }
}