<?php

namespace App\Application\Command\AuditLog;

use App\Models\AuditLog;

final class CreateAuditLogCommand
{
    public function execute(
        ?int $userId,
        string $action,
        string $targetTable,
        int $targetId,
        ?array $changes = null,
        ?string $ipAddress = null,
    ) : AuditLog {
        return AuditLog::create([
            'user_id'      => $userId,
            'action'       => $action,
            'target_table' => $targetTable,
            'target_id'    => $targetId,
            'changes'      => $changes,
            'ip_address'   => $ipAddress,
        ]);
    }
}