<?php

namespace App\Application\UseCases;

use App\Http\Response\PaginationResponse;
use App\Models\User;

class GetAllUserUseCase
{
    public function execute(int $perPage = 10): PaginationResponse
    {
        $users = User::paginate($perPage);

        return PaginationResponse::fromPaginator(
            $users,
            fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        );
    }
}