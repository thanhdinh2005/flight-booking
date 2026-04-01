<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Http\Requests\SearchFlightRequest;
use App\Application\UseCases\SearchFlightUseCase;

class FlightController extends Controller
{
    /**
     * Tiếp nhận yêu cầu tìm kiếm từ khách hàng (5 ngày liền kề + Phân trang)
     */
    public function search(SearchFlightRequest $request, SearchFlightUseCase $useCase)
    {
        try {
            // 1. Lấy dữ liệu validated (origin, destination, departure_date, return_date, passengers, page, return_page)
            $filters = $request->validated();

            // 2. Thực hiện logic tìm kiếm
            $results = $useCase->execute($filters);

            // 3. Trả về kết quả cho Frontend
            // Lưu ý: $results lúc này là mảng chứa các đối tượng Paginator
            return ApiResponse::success(
                $results, 
                'Tìm kiếm chuyến bay thành công.', 
                200 // Dùng 200 cho các thao tác truy vấn thành công
            );
            
        } catch (\Exception $e) {
            // Trường hợp có lỗi nghiệp vụ (như không tìm thấy chặng bay)
            return ApiResponse::error($e->getMessage(), 400);
        }
    }
}