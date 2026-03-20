<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Application\UseCases\Checkin\GetSeatMapUseCase;
use App\Application\UseCases\Checkin\CheckinUseCase; // UseCase thực hiện chọn ghế
use App\Application\UseCases\Checkin\ValidatePassengerIdentityUseCase; // UseCase khớp CCCD
use App\Http\Requests\CheckinSubmitRequest; // Request validate seat_number
use App\Http\Response\ApiResponse;
use Exception;
use App\Http\Requests\CheckinVerifyRequest;
class CheckinController extends Controller
{
    /**
     * Bước 1: Xác thực danh tính khách hàng
     */
    public function verifyIdentity(CheckinVerifyRequest $request, ValidatePassengerIdentityUseCase $useCase)
{
    // $request->validated() sẽ lấy các data đã check ở trên
    $useCase->execute($request->ticket_id, $request->validated());
    return ApiResponse::success(null, 'Xác thực danh tính thành công.');
}

    /**
     * Bước 2: Lấy sơ đồ ghế (Bạn đã viết, tôi chỉnh lại một chút cho chuẩn)
     */
    public function getSeatMap(Request $request, GetSeatMapUseCase $useCase)
    {
        $request->validate(['ticket_id' => 'required|integer']);

        try {
            $seatMap = $useCase->execute($request->ticket_id);
            return ApiResponse::success($seatMap, 'Lấy sơ đồ ghế thành công');
        } catch (Exception $e) {
            return ApiResponse::error($e->getMessage(), 400);
        }
    }

    /**
     * Bước 3: Xác nhận chọn ghế và hoàn tất Check-in
     */
    public function submitCheckin(CheckinSubmitRequest $request, CheckinUseCase $useCase)
{
    // Seat number chắc chắn đã đúng định dạng (VD: 12C)
    $ticket = $useCase->execute($request->ticket_id, $request->seat_number);
    return ApiResponse::success($ticket, 'Làm thủ tục thành công!');
}
}