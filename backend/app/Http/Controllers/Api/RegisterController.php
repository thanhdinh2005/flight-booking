<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Application\UseCases\RegisterUserUseCase;
use App\Http\Requests\RegisterRequest;
use App\Http\Response\ApiResponse;

class RegisterController extends Controller
{
    public function register(RegisterRequest $request)
    {

        $userResponse = app(RegisterUserUseCase::class) -> execute(
            email: $request->string('email'),
            password: $request->string('password'),
            firstName: $request->string('first_name'),
            lastName: $request->string('last_name'),
            phoneNumber: $request->string('phone_number')
        );

        return ApiResponse::success(
            $userResponse
        );
    }
}