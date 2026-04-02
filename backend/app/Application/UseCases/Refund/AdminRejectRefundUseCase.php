<?php

namespace App\Application\UseCases\Refund;

use App\Models\BookingRequest;
use App\Enums\Booking\RequestStatus;
use App\Enums\Booking\TicketStatus; // Đảm bảo Enum này tồn tại
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\CustomerRequestStatusUpdatedMail;
use Exception;

class AdminRejectRefundUseCase
{
    /**
     * Từ chối yêu cầu hoàn tiền
     */
    public function execute(int $requestId, int $adminId, string $reason): BookingRequest
    {
        // Sử dụng Transaction để đảm bảo tính toàn vẹn: 
        // Nếu update Request thành công mà update Ticket lỗi thì sẽ rollback hết.
        $request = DB::transaction(function () use ($requestId, $adminId, $reason) {
            
            // 1. Tìm request và khóa hàng (lockForUpdate) để tránh race condition
            $request = BookingRequest::with(['booking', 'ticket'])
                ->lockForUpdate()
                ->findOrFail($requestId);

            // 2. Kiểm tra trạng thái hợp lệ
            if ($request->status !== RequestStatus::PENDING) {
                throw new Exception("Yêu cầu này đã được xử lý (Thành công hoặc Đã từ chối trước đó).");
            }

            // 3. Khôi phục trạng thái vé
            // Khi khách gửi yêu cầu refund, vé thường chuyển sang trạng thái chờ (VD: REFUND_PENDING)
            // Nếu từ chối, ta trả vé về trạng thái có thể sử dụng để đi máy bay.
            if ($request->ticket) {
                $request->ticket->update([
                    'status' => TicketStatus::ACTIVE // Hoặc TicketStatus::PAID tùy hệ thống của bạn
                ]);
            }

            // 4. Cập nhật thông tin từ chối vào Request
            $request->update([
                'status'       => RequestStatus::REJECTED,
                'staff_id'     => $adminId,
                'staff_note'   => $reason, // Lý do từ chối (sẽ hiển thị cho khách xem hoặc lưu nội bộ)
                'processed_at' => now(),
            ]);

            return $request;
        });

        // 5. Gửi mail thông báo cho khách hàng
        // Việc gửi mail nên nằm ngoài DB Transaction để tránh làm chậm Transaction 
        // hoặc gửi mail xong nhưng DB lại bị Rollback.
        if ($request->booking && $request->booking->contact_email) {
            try {
                Mail::to($request->booking->contact_email)
                    ->queue(new CustomerRequestStatusUpdatedMail($request));
            } catch (Exception $e) {
                // Log lỗi gửi mail nhưng không làm dừng quy trình reject
                \Log::error("Lỗi gửi mail khi từ chối hoàn tiền: " . $e->getMessage());
            }
        }

        return $request;
    }
}