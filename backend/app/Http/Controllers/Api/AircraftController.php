<?php

namespace App\Http\Controllers\api;

use App\Exceptions\BusinessException;
use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Models\Aircraft;
use Illuminate\Http\Request;

class AircraftController extends Controller
{
    public function index(){
        $data = Aircraft::all();

        return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách mays bay thành công',
                'data' => $data
            ], 200);
    }

    public function getById($id) {
        $route = Aircraft::find($id);
        if (!$route) throw new BusinessException("Không tìm thấy tuyến bay");

        return ApiResponse::success($route);
    }
}
