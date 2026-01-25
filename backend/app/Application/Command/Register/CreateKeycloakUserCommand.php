<?php

namespace App\Application\Command\Register;

use App\Infracstructure\KeycloakService;

final class CreateKeycloakUserCommand
{
    public function __construct(
        private KeycloakService $keycloakService
    ) {}

    public function execute(
        string $email,
        string $password,
        string $firstName,
        string $lastName
    ): string {
        return $this->keycloakService->createUser(
            email: $email,
            password: $password,
            firstName: $firstName,
            lastName: $lastName
        );
    }
}
