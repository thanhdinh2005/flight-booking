<?php

namespace App\Application\Command\Register;

use App\Models\User;

final class CreateLocalUserCommand
{
    public function execute(
        string $email,
        string $firstName,
        string $lastName,
        string $phoneNumber,
        string $keycloakUserId,
        ?string $role = 'customer'
    ): User {
        return User::create([
            'email' => $email,
            'keycloak_id' => $keycloakUserId,
            'role' => $role,
            'phone_number' => $phoneNumber,
            'full_name' => $this->buildFullName($firstName, $lastName),
            'status' => \App\Enums\SystemStatus::ACTIVE,
        ]);
    }

    private function buildFullName(string $firstName, string $lastName): string
    {
        return trim("$firstName $lastName");
    }
}
