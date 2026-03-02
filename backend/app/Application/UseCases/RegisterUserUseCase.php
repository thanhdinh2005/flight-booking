<?php

namespace App\Application\UseCases;

use App\Application\Command\Register\CreateKeycloakUserCommand;
use App\Application\Command\Register\CreateLocalUserCommand;
use App\Application\Command\Register\DeleteKeycloakUserCommand;
use App\Http\Response\UserResponse;
use Illuminate\Support\Facades\DB;

final class RegisterUserUseCase
{
    public function __construct(
        private CreateKeycloakUserCommand $createKeycloakUser,
        private CreateLocalUserCommand $createLocalUser,
        private DeleteKeycloakUserCommand $deleteKeycloakUser,
    ) {}

    public function execute(
        string $email,
        string $password,
        string $firstName,
        string $lastName,
        string $phoneNumber
    ): UserResponse {
        DB::beginTransaction();
        try {
            $keycloakUserId = $this->createKeycloakUser->execute(
            email: $email,
            password: $password,
            firstName: $firstName,
            lastName: $lastName
        );

        $user = $this->createLocalUser->execute(
            email: $email,
            firstName: $firstName,
            lastName: $lastName,
            phoneNumber: $phoneNumber,
            keycloakUserId: $keycloakUserId
        );

        DB::commit();
        return new UserResponse(
            $user->id,
            $user->keycloak_id,
            $user->email,
            $user->full_name,
            $user->role,
            $user->phone_number,
            $user->created_at
        );
        } catch (\Throwable $e) {
            DB::rollBack();
            if (isset($keycloakUserId)) {
                $this->deleteKeycloakUser->execute($keycloakUserId);
            }
            throw $e;
        }
    }
}
