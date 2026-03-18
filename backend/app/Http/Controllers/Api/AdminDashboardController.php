<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\GetDashboardSummaryUseCase;
use App\Application\UseCases\GetLoadFactorStatisticUseCase;
use App\Application\UseCases\GetRevenueChartUseCase;
use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use Exception;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function getSummary(Request $request, GetDashboardSummaryUseCase $useCase)
    {
        // Validate định dạng ngày tháng (tùy chọn, FE có thể không truyền để lấy mặc định tháng này)
        $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        try {
            $data = $useCase->execute(
                $request->input('start_date'),
                $request->input('end_date')
            );

            return response()->json([
                'success' => true,
                'message' => 'Lấy dữ liệu thống kê tổng quan thành công',
                'data' => $data
            ], 200);

        } catch (Exception $e) {
            
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi khi tính toán thống kê',
                'error' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function getChart(Request $request, GetRevenueChartUseCase $useCase)
    {
        $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        try {
            $data = $useCase->execute(
                $request->input('start_date'),
                $request->input('end_date')
            );

            return response()->json([
                'success' => true,
                'message' => 'Lấy dữ liệu biểu đồ thành công',
                'data' => $data
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function loadFactor(Request $request, GetLoadFactorStatisticUseCase $useCase) {
        $request->validate([
            'start_date' => 'nullable|date_format:Y-m-d',
            'end_date' => 'nullable|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        try {
            $data = $useCase->execute(
                $request->input('start_date'),
                $request->input('end_date')
            );

            return ApiResponse::success($data);

        } catch (Exception $e) {
            throw $e;
        }
    }
}
