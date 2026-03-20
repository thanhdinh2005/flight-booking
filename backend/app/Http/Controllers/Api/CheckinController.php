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
use App\Application\UseCases\Checkin\GetBoardingPassUseCase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
class CheckinController extends Controller
{
    /**
     * Bước 1: Xác thực danh tính khách hàng
     */
    public function verifyIdentity(CheckinVerifyRequest $request, ValidatePassengerIdentityUseCase $useCase)
{
    try {
        // Lúc này $ticket sẽ là một Instance của Model Ticket, không phải true/false
        $ticket = $useCase->execute(
            (int) $request->ticket_id, 
            $request->validated()
        );

        // Tạo Token và lưu vào Cache
        $token = \Illuminate\Support\Str::random(40);
        \Illuminate\Support\Facades\Cache::put(
            "checkin_token_{$ticket->id}", 
            $token, 
            now()->addMinutes(15)
        );

        return ApiResponse::success([
            'ticket_id'     => $ticket->id,
            'checkin_token' => $token,
            'passenger'     => [
                'full_name' => $ticket->passenger->last_name . ' ' . $ticket->passenger->first_name
            ]
        ], "Xác thực thành công.");

    } catch (Exception $e) {
        return ApiResponse::error($e->getMessage(), 422);
    }
}

    /**
     * Bước 2: Lấy sơ đồ ghế (Bạn đã viết, tôi chỉnh lại một chút cho chuẩn)
     */
    public function getSeatMap(Request $request, GetSeatMapUseCase $useCase)
{
    try {
        $seatMap = $useCase->execute(
            (int) $request->query('ticket_id'),
            (string) $request->query('checkin_token')
        );
        return ApiResponse::success($seatMap);
    } catch (\Exception $e) {
        // Nếu là lỗi SQL (như 42704), ta trả về 500. Nếu là lỗi Token, trả về 403.
        $code = ($e->getCode() >= 100 && $e->getCode() < 600) ? $e->getCode() : 500;
        
        return ApiResponse::error($e->getMessage(), $code);
    }
}

    /**
     * Bước 3: Xác nhận chọn ghế và hoàn tất Check-in
     */
    public function submitCheckin(CheckinSubmitRequest $request, CheckinUseCase $useCase)
{
    try {
        // Sử dụng dữ liệu đã validate từ Request
        $ticket = $useCase->execute(
            $request->ticket_id,
            $request->seat_number,
            $request->checkin_token
        );

        return ApiResponse::success($ticket, 'Làm thủ tục thành công!');

    } catch (Exception $e) {
        // Nếu mã lỗi là 409 (Tranh chấp ghế) hoặc 403 (Hết hạn token)
        $code = in_array($e->getCode(), [403, 409]) ? $e->getCode() : 400;
        
        return ApiResponse::error($e->getMessage(), $code);
    }
}

public function getBoardingPass($id, GetBoardingPassUseCase $useCase, Request $request)
    {
        try {
            $userId = $request->user()->id;
            // Ép kiểu ID sang int
            $data = $useCase->execute((int) $id, $userId);

            return ApiResponse::success($data, "Tải thông tin thẻ lên máy bay thành công.");
            
        } catch (Exception $e) {
            // Xử lý mã lỗi HTTP linh hoạt
            $code = ($e->getCode() >= 100 && $e->getCode() < 600) ? $e->getCode() : 500;
            return ApiResponse::error($e->getMessage(), $code);
        }
    }
}