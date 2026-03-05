<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Application\UseCases\GetCurrentUserProfileUseCase;
use App\Application\UseCases\UpdateUserProfileUseCase;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\Request;

class UserProfileController extends Controller
{
    public function getProfile(Request $request, GetCurrentUserProfileUseCase $useCase) 
    {
        $keycloakId = $request->attributes->get('keycloak_id');

        $userResponse = $useCase->execute($keycloakId);

        return ApiResponse::success($userResponse);
    }

    public function updateProfile(UpdateProfileRequest $request, UpdateUserProfileUseCase $useCase) 
    {
        $keycloakId = $request->attributes->get('keycloak_id');

        $validatedData = $request->validated();
        if (empty($validatedData)) {
            throw new BusinessException("No data provided for update.");
        }

        $userResponse = $useCase->execute($keycloakId, $validatedData);

        return ApiResponse::success($userResponse, "Profile updated successfully");
    }
}
