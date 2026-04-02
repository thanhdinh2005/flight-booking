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
                'name' => $user->full_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
                'created_at' => $user->created_at,
                'status' => $user->status
            ]
        );
    }
}