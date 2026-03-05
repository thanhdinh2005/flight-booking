<?php

namespace App\Application\Command\Register;

use App\Infracstructure\KeycloakService;

final class AssignRoleUserCommand
{
    public function __construct(
        private KeycloakService $keycloak_service
    )
    {}

    public function execute(string $keycloak_id, string $role_name) {
        $this->keycloak_service->assignRealmRole($keycloak_id, strtoupper($role_name));
    }
}