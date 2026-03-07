<?php

namespace App\Application\UseCases;

use App\Application\Command\AuditLog\CreateAuditLogCommand;
use App\Application\Command\FlightSchedule\ReactiveFlightScheduleCommand;
use Throwable;
use Illuminate\Support\Facades\DB;

final class ReactiveScheduleUseCase
{
    public function __construct(
        private ReactiveFlightScheduleCommand $reactivateCmd,
        private CreateAuditLogCommand $auditCmd,
    )
    {}

    public function execute(
        int $scheduleId,
        int $adminId,
        string $ipAddress
    ){
        DB::beginTransaction();
        try{
            $schedule = $this->reactivateCmd->execute($scheduleId);

            $this->auditCmd->execute(
                userId: $adminId,
                action: 'REACTIVATE_SCHEDULE',
                targetTable: 'flight_schedules',
                targetId: $schedule->id,
                changes: [
                    'is_active' => [
                        'new' => true,
                        'old' => false                        
                    ]
                ],
                ipAddress: $ipAddress
            );

            DB::commit();
        } catch (Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }
}