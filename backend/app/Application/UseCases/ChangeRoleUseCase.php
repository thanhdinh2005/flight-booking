<?php

namespace App\Application\UseCases;

use App\Exceptions\BusinessException;
use App\Infracstructure\KeycloakService;
use App\Models\User;

class ChangeRoleUseCase
{
    public function execute(int $userId, string $roleName) {
        $user = User::find($userId);
        if (!$user) throw new BusinessException("Không tìm thấy người dùng");

        app(KeycloakService::class)->removeRealmRole($user->keycloak_id, strtoupper($user->role));
        app(KeycloakService::class)->assignRealmRole($user->keycloak_id, $roleName);
        $user->update([
            'role' => $roleName
        ]);
    }
}