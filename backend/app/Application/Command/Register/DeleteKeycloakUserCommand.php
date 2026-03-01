<?php

namespace App\Application\Command\Register;

use App\Infracstructure\KeycloakService;

final class DeleteKeycloakUserCommand
{
    public function execute(string $keycloakUserId) : void{
        app(KeycloakService::class) -> deleteUser($keycloakUserId);
    }
}