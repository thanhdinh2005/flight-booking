<?php

namespace App\Application\Command\Register;

use App\Models\User;

final class CreateLocalUserCommand
{
    public function execute(
        string $email,
        string $keycloakUserId
    ): void {
        User::create([
            'email' => $email,
            'keycloak_id' => $keycloakUserId,
        ]);
    }
}
