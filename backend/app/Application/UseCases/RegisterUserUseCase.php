<?php

namespace App\Application\UseCases;

use App\Application\Command\Register\AssignRoleUserCommand;
use App\Application\Command\Register\CreateKeycloakUserCommand;
use App\Application\Command\Register\CreateLocalUserCommand;
use App\Application\Command\Register\DeleteKeycloakUserCommand;
use App\Http\Response\UserResponse;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

final class RegisterUserUseCase
{
    public function __construct(
        private CreateKeycloakUserCommand $createKeycloakUser,
        private CreateLocalUserCommand $createLocalUser,
        private DeleteKeycloakUserCommand $deleteKeycloakUser,
        private AssignRoleUserCommand $assign_role_user
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

        $this->assign_role_user->execute($keycloakUserId, "CUSTOMER");

        Mail::to($user->email)->queue(
            new WelcomeMail([
                'user_name' => $user->full_name,
                'email' => $user->email
            ])
        );

        DB::commit();
        return new UserResponse(
            $user->id,
            $user->keycloak_id,
            $user->email,
            $user->full_name,
            $user->role,
            $user->phone_number,
            $user->created_at,
            $user->updated_at,
            $user->status
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
