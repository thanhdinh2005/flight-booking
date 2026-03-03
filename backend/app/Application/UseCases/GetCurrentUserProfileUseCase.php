<?php

namespace App\Application\UseCases;

use App\Exceptions\EntityNotFoundException;
use App\Http\Response\UserResponse;
use App\Models\User;

final class GetCurrentUserProfileUseCase
{
    function execute($keycloakId) : UserResponse {
        $user = User::findByKeycloakId($keycloakId);

        if (!$user) {
            throw new EntityNotFoundException("User not found");
        }

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
    }


}