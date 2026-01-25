<?php

namespace App\Application\UseCases;

use App\Application\Command\Register\CreateKeycloakUserCommand;
use App\Application\Command\Register\CreateLocalUserCommand;
use App\Infracstructure\KeycloakService;

final class RegisterUserUseCase
{
    public function __construct(
        private CreateKeycloakUserCommand $createKeycloakUser,
        private CreateLocalUserCommand $createLocalUser,
    ) {}

    public function execute(
        string $email,
        string $password,
        string $firstName,
        string $lastName
    ): void {
        try {
            $keycloakUserId = $this->createKeycloakUser->execute(
            email: $email,
            password: $password,
            firstName: $firstName,
            lastName: $lastName
        );

        $this->createLocalUser->execute(
            email: $email,
            keycloakUserId: $keycloakUserId
        );
        } catch (\Throwable $e) {
            report($e);
            throw $e;
        }
    }
}
