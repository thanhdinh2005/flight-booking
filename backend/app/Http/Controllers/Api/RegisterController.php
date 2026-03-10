<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\RegisterUserUseCase;
use App\Http\Requests\RegisterRequest;
use App\Http\Response\ApiResponse;
use OpenApi\Annotations as OA;

class RegisterController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/register",
     *     summary="Register user",
     *     tags={"Auth"},
     *
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/RegisterRequest")
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Register user successfully",
     *
     *         @OA\JsonContent(
     *             allOf={
     *                 @OA\Schema(ref="#/components/schemas/ApiResponse"),
     *
     *                 @OA\Schema(
     *                     @OA\Property(
     *                         property="data",
     *                         ref="#/components/schemas/UserResponse"
     *                     )
     *                 )
     *             }
     *         )
     *     )
     * )
     */
    public function register(RegisterRequest $request)
    {
        $userResponse = app(RegisterUserUseCase::class)->execute(
            email: $request->string('email'),
            password: $request->string('password'),
            firstName: $request->string('first_name'),
            lastName: $request->string('last_name'),
            phoneNumber: $request->string('phone_number')
        );

        return ApiResponse::success($userResponse);
    }
}