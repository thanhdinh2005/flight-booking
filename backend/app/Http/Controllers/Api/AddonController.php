<?php

namespace App\Http\Controllers\api;
use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use Illuminate\Http\Request;
use App\Models\Addon; 

class AddonController extends Controller{
    public function getAll(Request $request)
    {
        try {
            // Lấy tất cả Addon từ DB
            $addons = Addon::all();

            if ($addons->isEmpty()) {
                return ApiResponse::error('Không có addon nào.', 404);
            }

            return ApiResponse::success($addons, 'Danh sách addon');
        } catch (\Exception $e) {
            return ApiResponse::error('Lỗi hệ thống: '.$e->getMessage(), 500);
        }
    }

}