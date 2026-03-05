<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Response\SearchFlightResponse; // Lớp định dạng kết quả trả về
use Illuminate\Http\Request;
use App\Http\Requests\SearchFlightRequest; // Lớp kiểm tra dữ liệu đầu vào
use App\Application\UseCases\SearchFlightUseCase; // Lớp xử lý logic

class FlightController extends Controller
{
    /**
     * Tiếp nhận yêu cầu tìm kiếm từ khách hàng
     */
    public function search(SearchFlightRequest $request, SearchFlightUseCase $useCase)
    {
        // 1. Lấy dữ liệu đã qua kiểm duyệt (origin, destination, date...)
        $filters = $request->validated();

        // 2. Chuyền "đơn hàng" cho UseCase để đi tìm trong Database
        $results = $useCase->execute($filters);

        // 3. Đưa kết quả tìm được vào lớp Response để đóng gói JSON gửi về FE
        return new SearchFlightResponse(
            $results['outbound'], 
            $results['return'],
            $filters['departure_date'], 
            $filters['return_date'] ?? null
        );
    }
}
