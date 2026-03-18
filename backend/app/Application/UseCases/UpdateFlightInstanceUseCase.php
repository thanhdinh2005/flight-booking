<?php

namespace App\Application\UseCases;

use App\Application\Command\AuditLog\CreateAuditLogCommand;
use App\Application\Command\FlightInstance\UpdateFlightInstanceCommand;
use App\Exceptions\BusinessException;
use App\Jobs\NotifyFlightDelayJob;
use App\Models\FlightInstance;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

final class UpdateFlightInstanceUseCase
{
    public function __construct(
        private UpdateFlightInstanceCommand $updateInstanceCmd,
        private CreateAuditLogCommand $auditCmd
    ) {}

    public function execute(
        int $instanceId,
        string $newDepartureTime,
        int $adminId,
        string $ipAddress
    ): FlightInstance {

        $instance = FlightInstance::with('route')->findOrFail($instanceId);

        if (in_array($instance->status, ['DEPARTED', 'CANCELLED'])) {
            throw new BusinessException(
                "Không thể cập nhật chuyến bay đã khởi hành hoặc đã hủy"
            );
        }

        $std = Carbon::parse($instance->std);

        $newEtd = Carbon::parse($newDepartureTime);

        if ($newEtd->isBefore($std)) {
            throw new BusinessException(
                "Không thể bay sớm hơn giờ STD ban đầu."
            );
        }

        $delayMinutes = $newEtd->diffInMinutes($std);

        if ($delayMinutes > 60) {
            throw new BusinessException(
                "Chỉ được phép delay tối đa 60 phút."
            );
        }

        if ($delayMinutes === 0) {
            return $instance;
        }

        $flightDuration = $instance->route->flight_duration_minutes;

        $newEta = $newEtd->copy()->addMinutes($flightDuration);

        $changes = [
            'etd' => [
                'old' => $instance->etd,
                'new' => $newEtd->toDateTimeString()
            ],
            'eta' => [
                'old' => $instance->eta,
                'new' => $newEta->toDateTimeString()
            ],
            'status' => [
                'old' => $instance->status,
                'new' => 'DELAYED'
            ]
        ];

        DB::beginTransaction();

        try {

            $updatedInstance = $this->updateInstanceCmd->execute(
                $instance,
                $newEtd,
                $newEta
            );

            $this->auditCmd->execute(
                userId: $adminId,
                action: "DELAY_FLIGHT_INSTANCE",
                targetTable: "flight_instances",
                targetId: $instance->id,
                changes: $changes,
                ipAddress: $ipAddress
            );

            DB::commit();

            NotifyFlightDelayJob::dispatch(
                $instance->id,
                $std->toDateTimeString(),
                $newEtd->toDateTimeString()
            );

            return $updatedInstance;

        } catch (Throwable $e) {

            DB::rollBack();
            throw $e;

        }
    }
}