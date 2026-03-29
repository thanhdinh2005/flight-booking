<?php

namespace App\Http\Controllers\api;

use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Models\Route;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RouteController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $routes = Route::with(['origin', 'destination'])
                ->orderBy('id', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách tuyến bay thành công',
                'data' => $routes
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách tuyến bay: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getRouteById($id) {
        $route = Route::find($id);
        if (!$route) throw new BusinessException("Không tìm thấy tuyến bay");

        return ApiResponse::success($route);
    }
}
