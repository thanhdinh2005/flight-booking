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
use App\Application\UseCases\Refund\CustomerCancelRefundUseCase;
use App\Enums\Booking\TicketStatus;
class CustomerBookingController extends Controller
{
    public function listActiveTickets(Request $request)
{
    try {
        // 1. Lấy dữ liệu từ Body của Request POST
        $pnr = strtoupper(trim($request->input('pnr')));
        $email = trim($request->input('email'));

        if (!$pnr || !$email) {
            return ApiResponse::error('Vui lòng nhập mã PNR và Email để tra cứu.', 400);
        }

        // 2. Truy vấn tìm Booking thông qua PNR và Email chủ sở hữu
        $booking = \App\Models\Booking::where('pnr', $pnr)
            ->where('contact_email', $email) // Lấy trực tiếp từ cột contact_email của bảng bookings
            ->first();

        if (!$booking) {
            return ApiResponse::error('Không tìm thấy thông tin đặt chỗ hoặc Email không khớp.', 404);
        }

        // 3. Lấy danh sách vé thỏa mãn (Chưa bay, đã thanh toán)
        $tickets = \App\Models\Ticket::with(['flight_instance.flightSchedule', 'passenger'])
            ->where('booking_id', $booking->id)
            ->where('status', TicketStatus::ACTIVE->value) // Tùy theo status bạn quy định
            ->whereHas('flight_instance', function ($query) {
                // Chỉ lấy vé có giờ khởi hành (std) trong tương lai
                $query->where('std', '>', now());
            })
            ->get();

        if ($tickets->isEmpty()) {
            return ApiResponse::error('Mã PNR hợp lệ nhưng không có vé nào khả dụng (đã bay hoặc đã hoàn).', 404);
        }

        return ApiResponse::success(
            $tickets->values(), 
            'Danh sách vé khả dụng cho PNR: ' . $pnr
        );

    } catch (\Exception $e) {
        return ApiResponse::error('Lỗi hệ thống: ' . $e->getMessage(), 500);
    }
}

    public function previewRefund($ticketId, GetRefundPreviewUseCase $useCase, Request $request)
{
    try {
        $userId = $request->user()->id;
        $data = $useCase->execute($ticketId, $userId);
        return ApiResponse::success($data, 'Thông tin hoàn tiền dự kiến.');
    } catch (\Exception $e) {
        return ApiResponse::error($e->getMessage(), 400);
    }
}
// Route: POST /api/refund/confirm
public function confirmRefund(StoreRefundRequest $request, CreateRefundRequestUseCase $useCase)
{
    $data = $request->validated();
    
    // THIẾU DÒNG NÀY:
    $userId = $request->user()->id; 

    try {
        // Truyền $userId vào đây
        $result = $useCase->execute((int) $data['ticket_id'], $data['reason'], $userId);
        return ApiResponse::success($result, 'Yêu cầu hoàn tiền đã được gửi.');
    } catch (\Exception $e) {
        return ApiResponse::error($e->getMessage(), 400);
    }
}
public function cancelRefundRequest($id, CustomerCancelRefundUseCase $useCase, Request $request)
{
    try {
        $userId = $request->user()->id;
        
        $result = $useCase->execute((int) $id, $userId);

        return ApiResponse::success(
            $result, 
            'Đã hủy yêu cầu hoàn vé thành công. Vé của bạn đã có hiệu lực trở lại.'
        );
    } catch (Exception $e) {
        return ApiResponse::error($e->getMessage(), 400);
    }
}
}