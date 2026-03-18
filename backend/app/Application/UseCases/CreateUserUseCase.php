<?php

namespace App\Application\UseCases;

use App\Application\Command\Register\AssignRoleUserCommand;
use App\Application\Command\Register\CreateKeycloakUserCommand;
use App\Application\Command\Register\CreateLocalUserCommand;
use App\Application\Command\Register\DeleteKeycloakUserCommand;
use App\Exceptions\BusinessException;
use App\Exceptions\EntityNotFoundException;
use App\Http\Response\UserResponse;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

final class CreateUserUseCase
{
    public function __construct(
        private CreateKeycloakUserCommand $createKeycloakUser,
        private CreateLocalUserCommand $createLocalUser,
        private DeleteKeycloakUserCommand $deleteKeycloakUser,
        private AssignRoleUserCommand $assign_role_user
    )
    {}

    public function execute(
        string $email,
        string $password,
        string $firstName,
        string $lastName,
        string $phoneNumber,
        string $role
    ): UserResponse {
        if ($role !== 'CUSTOMER' && $role !== 'ADMIN' && $role !== 'STAFF') throw new BusinessException('Role không hợp lệ!');

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
            keycloakUserId: $keycloakUserId,
            role: $role
        );

        $this->assign_role_user->execute($keycloakUserId, $role);
        DB::commit();

        Mail::to($user->email)->queue(
            new WelcomeMail([
                'user_name' => $user->full_name,
                'email' => $user->email
            ])
        );

        return new UserResponse(
            $user->id,
            $user->keycloak_id,
            $user->email,
            $user->full_name,
            $user->role,
            $user->phone_number,
            $user->created_at,
            $user->updated_at
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