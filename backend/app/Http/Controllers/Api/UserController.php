<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\CreateUserUseCase;
use App\Application\UseCases\GetAllUserUseCase;
use App\Exceptions\EntityNotFoundException;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UserFilterRequest;
use App\Http\Response\ApiResponse;
use App\Http\Response\PaginationResponse;
use App\Models\User;
use Illuminate\Http\Request;

use function Symfony\Component\Clock\now;

class UserController extends Controller
{
    public function createUser(CreateUserRequest $request, CreateUserUseCase $usecase) {
        $userResponse = $usecase -> execute(
            email: $request->string('email'),
            password: $request->string('password'),
            firstName: $request->string('first_name'),
            lastName: $request->string('last_name'),
            phoneNumber: $request->string('phone_number'),
            role: $request->string('role')
        );

        return ApiResponse::success($userResponse);
    }

    public function getAllUser(Request $request, GetAllUserUseCase $useCase) {
        $perPage = $request->input('per_page', 10);

        $result = $useCase->execute($perPage);

        return ApiResponse::success(
            message: 'Lấy người dùng thành công',
            data: $result->data,
            meta: $result->meta
        );
    }

    public function getUserById(int $userId) {
        $user = User::find($userId);
        if (!$user) throw new EntityNotFoundException("Không tìm thấy người dùng!");

        return ApiResponse::success(data: $user);
    }

    public function index(Request $request)
    {
        $filters = $request->all();

        $perPage = $request->input('per_page', 10);

        $paginator = User::query()
            ->filter($filters)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $pagination = PaginationResponse::fromPaginator(
            $paginator,
            fn(User $user) => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ]
        );

        return ApiResponse::success(
            $pagination->data,
            "Thành công",
            200,
            $pagination->meta
        );
    }

    public function disable(int $userId) {
        $user = User::find($userId);
        if (!$user) throw new EntityNotFoundException("Không tìm thấy người dùng!");

        $user->update([
            'status' => 'disable',
            'disabled_at' => now()    
        ]);

        return ApiResponse::success(data: $user);
    }
    
    public function active(int $userId) {
        $user = User::find($userId);
        if (!$user) throw new EntityNotFoundException("Không tìm thấy người dùng!");

        $user->update(['status' => 'active']);

        return ApiResponse::success(data: $user);
    }
}
