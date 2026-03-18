<?php

namespace app\Http\Controllers\Api;

use App\Http\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdminApproveRefundRequest;
use App\Application\UseCases\Refund\AdminApproveRefundUseCase;
use App\Application\UseCases\Refund\AdminRejectRefundUseCase;
use App\Models\BookingRequest;
use Illuminate\Http\Request;
use Exception;

class AdminBookRequestController extends Controller
{
    /**
     * Lấy danh sách tất cả các yêu cầu (có lọc theo trạng thái và phân trang)
     */
    public function index(Request $request)
    {
        try {
            $query = BookingRequest::with(['staff', 'ticket']);

            // Lọc theo trạng thái (PENDING, APPROVED, REJECTED)
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Mặc định xem các yêu cầu mới nhất
            $list = $query->orderBy('created_at', 'desc')->paginate(15);

            return ApiResponse::success($list, 'Lấy danh sách yêu cầu thành công.');
        } catch (Exception $e) {
            return ApiResponse::error('Lỗi khi tải danh sách: ' . $e->getMessage());
        }
    }

    /**
     * Xem chi tiết 1 yêu cầu cụ thể kèm theo thông tin Ticket, Addons và Max Refund
     */
    public function show($id)
    {
        try {
            // Eager load toàn bộ thông tin liên quan để Admin kiểm tra
            $bookingRequest = BookingRequest::with([
                'user', 
                'ticket.addons', 
                'ticket.flight_instance.flightSchedule',
                'booking'
            ])->findOrFail($id);

            // Tính toán tổng số tiền tối đa có thể hoàn (Vé + tất cả Addons)
            $addonsTotal = $bookingRequest->ticket->addons->sum(function($addon) {
                return (float) $addon->amount * $addon->quantity;
            });
            
            // Đính kèm dữ liệu vào response để Admin Dashboard hiển thị giới hạn nhập liệu
            $bookingRequest->max_refundable_amount = $bookingRequest->ticket->total_price + $addonsTotal;

            return ApiResponse::success($bookingRequest, 'Lấy chi tiết yêu cầu thành công.');
        } catch (Exception $e) {
            return ApiResponse::error('Không tìm thấy yêu cầu: ' . $e->getMessage(), 404);
        }
    }

    /**
     * Phê duyệt yêu cầu và thực hiện hoàn tiền thực tế
     */
    public function approve(AdminApproveRefundRequest $request, $id, AdminApproveRefundUseCase $useCase)
    {
        try {
            $userId = $request->user()->id;
            
            $result = $useCase->execute(
                (int) $id, 
                (float) $request->final_amount, 
                (int) $userId, 
                $request->staff_note
            );

            return ApiResponse::success($result, 'Yêu cầu hoàn tiền đã được phê duyệt và xử lý tài chính.');
        } catch (Exception $e) {
            return ApiResponse::error($e->getMessage(), 400);
        }
    }

    /**
     * Từ chối yêu cầu hoàn tiền
     */
    public function reject(Request $request, $id, AdminRejectRefundUseCase $useCase)
    {
        try {
            $request->validate([
                'staff_note' => 'required|string|min:5'
            ]);

            $userId = $request->user()->id;
            
            $result = $useCase->execute(
                (int) $id,
                (int) $userId,
                $request->staff_note
            );

            return ApiResponse::success($result, 'Đã từ chối yêu cầu hoàn tiền.');
        } catch (Exception $e) {
            return ApiResponse::error($e->getMessage(), 400);
        }
    }
}