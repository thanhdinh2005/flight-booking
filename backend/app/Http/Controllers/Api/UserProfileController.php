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
    /**
     * @OA\Get(
     *     path="/api/me",
     *     summary="Get current user profile",
     *     tags={"User"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="User profile retrieved successfully",
     *
     *         @OA\JsonContent(
     *             allOf={
     *                 @OA\Schema(ref="#/components/schemas/ApiResponse"),
     *                 @OA\Schema(
     *                     @OA\Property(
     *                         property="data",
     *                         ref="#/components/schemas/UserResponse"
     *                     )
     *                 )
     *             }
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function getProfile(Request $request, GetCurrentUserProfileUseCase $useCase) 
    {
        $user = $request->user();

        $userResponse = $useCase->execute($user->keycloak_id);

        return ApiResponse::success($userResponse);
    }

    /**
     * @OA\Put(
     *     path="/api/me",
     *     summary="Update current user profile",
     *     tags={"User"},
     *     security={{"bearerAuth":{}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/UpdateProfileRequest")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Profile updated successfully",
     *
     *         @OA\JsonContent(
     *             allOf={
     *                 @OA\Schema(ref="#/components/schemas/ApiResponse"),
     *                 @OA\Schema(
     *                     @OA\Property(
     *                         property="data",
     *                         ref="#/components/schemas/UserResponse"
     *                     )
     *                 )
     *             }
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="No data provided for update"
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized"
     *     )
     * )
     */
    public function updateProfile(UpdateProfileRequest $request, UpdateUserProfileUseCase $useCase) 
    {
        $user = $request->user();

        $validatedData = $request->validated();
        if (empty($validatedData)) {
            throw new BusinessException("Request rỗng.");
        }

        $userResponse = $useCase->execute($user->keycloak_id, $validatedData);

        return ApiResponse::success($userResponse, "Cập nhật hồ sơ thành công");
    }
}
