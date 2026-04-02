<?php

namespace App\Http\Controllers\Api; // Sửa 'app' thành 'App' cho đúng chuẩn PSR-4

use App\Http\Response\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdminApproveRefundRequest;
use App\Application\UseCases\Refund\AdminApproveRefundUseCase;
use App\Application\UseCases\Refund\AdminRejectRefundUseCase;
use App\Models\BookingRequest;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Illuminate\Support\Facades\Log;

class AdminBookRequestController extends Controller
{
    /**
     * Lấy danh sách yêu cầu (Phân trang & Lọc)
     */
    public function index(Request $request)
    {
        try {
            $query = BookingRequest::with(['staff', 'ticket.passenger', 'booking']);

            // Lọc theo trạng thái nếu có
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $list = $query->latest()->paginate(15);

            return ApiResponse::success($list, 'Lấy danh sách yêu cầu thành công.');
        } catch (Exception $e) {
            Log::error("Admin Refund Index Error: " . $e->getMessage());
            return ApiResponse::error('Lỗi khi tải danh sách yêu cầu.');
        }
    }

    /**
     * Chi tiết yêu cầu
     */
    public function show($id)
    {
        try {
            $bookingRequest = BookingRequest::with([
                'user', 
                'ticket.addons', 
                'ticket.passenger', // Thêm thông tin khách để Admin đối soát
                'ticket.flight_instance.flightSchedule.route.origin',
                'ticket.flight_instance.flightSchedule.route.destination',
                'booking'
            ])->findOrFail($id);

            // Gợi ý: Nên để logic tính tiền này trong Model BookingRequest
            // $bookingRequest->append('max_refundable_amount'); 

            return ApiResponse::success($bookingRequest, 'Lấy chi tiết yêu cầu thành công.');

        } catch (ModelNotFoundException $e) {
            return ApiResponse::error('Yêu cầu hoàn tiền không tồn tại.', 404);
        } catch (Exception $e) {
            return ApiResponse::error('Lỗi hệ thống: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Phê duyệt hoàn tiền
     */
    public function approve(AdminApproveRefundRequest $request, $id, AdminApproveRefundUseCase $useCase)
    {
        try {
            $adminId = $request->user()->id;
            
            // TRƯỚC KHI GỌI VNPAY: Cập nhật số tiền chốt hoàn và ghi chú của Admin vào DB
            // Điều này đảm bảo khi UseCase chạy, nó lấy đúng số tiền này để gửi sang VNPAY
            $bookingRequest = BookingRequest::findOrFail($id);
            $bookingRequest->update([
                'refund_amount' => $request->final_amount,
                'staff_note'    => $request->staff_note,
            ]);

            // THỰC THI USECASE: Gọi VNPAY -> Cập nhật trạng thái -> Giải phóng ghế -> Gửi 01 Mail
            $result = $useCase->execute(
                (int) $id, 
                (int) $adminId
            );

            return ApiResponse::success($result, 'Đã phê duyệt và hoàn tất giao dịch hoàn tiền qua VNPAY.');

        } catch (ModelNotFoundException $e) {
            return ApiResponse::error('Yêu cầu hoàn tiền không tồn tại.', 404);
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 400);
        } catch (Exception $e) {
            // Log lỗi để Admin kiểm tra (Ví dụ: VNPAY từ chối do hết hạn)
            Log::critical("Refund Approval Error: " . $e->getMessage(), ['request_id' => $id]);
            return ApiResponse::error('Xử lý thất bại: ' . $e->getMessage(), 500);
        }
    }   

    /**
     * Từ chối hoàn tiền
     */
    public function reject(Request $request, $id, AdminRejectRefundUseCase $useCase)
    {
        try {
            $request->validate([
                'staff_note' => 'required|string|min:10' // Note từ chối nên dài và rõ ràng hơn
            ]);

            $adminId = $request->user()->id;
            
            $result = $useCase->execute(
                (int) $id,
                (int) $adminId,
                $request->staff_note
            );

            return ApiResponse::success($result, 'Đã từ chối yêu cầu hoàn vé.');

        } catch (Exception $e) {
            return ApiResponse::error($e->getMessage(), 400);
        }
    }
}