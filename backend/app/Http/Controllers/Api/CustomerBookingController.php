<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Models\Booking; // Thêm vào
use App\Models\Ticket;  // Thêm vào
use Carbon\Carbon;
use Exception;
use App\Http\Requests\StoreRefundRequest;
use App\Application\UseCases\Refund\CreateRefundRequestUseCase;
use App\Application\UseCases\Refund\GetRefundPreviewUseCase;
use Illuminate\Http\Request;

class CustomerBookingController extends Controller
{
    public function listActiveTickets(Request $request, $bookingId)
    {
        try {
            // Kiểm tra quyền sở hữu booking
            $booking = Booking::where('id', $bookingId)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            // Lấy danh sách vé kèm theo thông tin chuyến bay và ghế
            $tickets = Ticket::with(['flightInstance', 'passenger']) // Load các quan hệ đã định nghĩa trong Ticket model
    ->where('booking_id', $bookingId)
    ->where('status', 'PAID')
    ->whereHas('flightInstance', function ($query) {
        // Sử dụng cột 'std' và so sánh với thời gian hiện tại (now())
        $query->where('std', '>', now());
    })
    ->get();

            // Sử dụng values() để reset lại key của array sau khi filter
            return ApiResponse::success(
                $tickets->values(), 
                'Danh sách vé khả dụng.', 
                200
            );
        } catch (Exception $e) {
            return ApiResponse::error('Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.', 404);
        }
    }

    public function previewRefund($ticketId, GetRefundPreviewUseCase $useCase)
{
    try {
        $data = $useCase->execute($ticketId);
        return ApiResponse::success($data, 'Thông tin hoàn tiền dự kiến.');
    } catch (\Exception $e) {
        return ApiResponse::error($e->getMessage(), 400);
    }
}
// Route: POST /api/refund/confirm
public function confirmRefund(StoreRefundRequest $request, CreateRefundRequestUseCase $useCase,)
{
    $data = $request->validated();
    $userId =$request->user()->id;
    try {
        $result = $useCase->execute($data['ticket_ids'], $data['reason'], $userId);
        return ApiResponse::success(
            $result, 
            'Yêu cầu hoàn tiền đã được gửi. Vui lòng chờ Admin phê duyệt.', 
            201
        );
    } catch (\Exception $e) {
        return ApiResponse::error($e->getMessage(), 400);
    }
}
}