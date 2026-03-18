<?php
namespace App\Application\UseCases\Refund;

use App\Models\BookingRequest;
use App\Models\Ticket;
use App\Models\FlightSeatInventory; // Giả sử đây là bảng quản lý chỗ ngồi
use Illuminate\Support\Facades\DB;
use Exception;

class AdminApproveRefundUseCase
{
    // File: app/Application/UseCases/Admin/ApproveRefundUseCase.php

public function execute(int $requestId, float $finalAmount, int $adminId, ?string $note = null): BookingRequest
{
    return DB::transaction(function () use ($requestId, $finalAmount, $adminId, $note) {
        
        // 1. Load Ticket kèm theo Addons để tính tổng tiền
        $request = BookingRequest::with(['ticket.addons', 'booking'])->lockForUpdate()->findOrFail($requestId);
        $ticket = $request->ticket;
        $booking = $ticket->booking;
        // 2. Tính tổng giá trị thực tế (Giá vé + Tổng tiền Addons)
        $addonsTotal = $ticket->addons->sum(function($addon) {
            return (float) $addon->price * $addon->quantity; 
        });
        
        $maxRefundableAmount = $ticket->total_price + $addonsTotal;

        // 3. Kiểm tra tính hợp lệ với Tổng giá trị mới
        if ($finalAmount > $maxRefundableAmount) {
            throw new Exception(
                "Số tiền hoàn (" . number_format($finalAmount) . ") không được vượt quá tổng giá trị vé và dịch vụ đi kèm (" . number_format($maxRefundableAmount) . ")."
            );
        }

        // ... Các bước update trạng thái tiếp theo giữ nguyên ...
        $request->update([
            'status' => 'APPROVED',
            'total_refund_amount' => $finalAmount,
            'staff_id' => $adminId,
            'staff_note' => $note,
            'processed_at' => now(),
        ]);
        // Giảm tổng tiền của đơn hàng tương ứng với số tiền Admin quyết định hoàn trả
        $booking->total_amount = $booking->total_amount - $finalAmount;
        // Nếu sau khi hoàn, tổng tiền nhỏ hơn 0 (lỗi logic dữ liệu), trả về lỗi
        if ($booking->total_amount < 0) {
            $booking->total_amount = 0; 
        }
        $booking->save();

        // Đừng quên giải phóng ghế và cập nhật trạng thái vé nhé!
        $ticket->update(['status' => 'REFUNDED']);
        $this->releaseSeat($ticket);

        return $request;
    });
}

    /**
     * Logic giải phóng ghế để hệ thống có thể bán lại
     */
    private function releaseSeat(Ticket $ticket)
    {
        // Giả sử bạn quản lý ghế qua bảng flight_seat_availabilities
        // dựa trên flight_instance_id và seat_id (hoặc seat_number)
        DB::table('flight_seat_inventory')
            ->where('flight_instance_id', $ticket->flight_instance_id)
            ->where('seat_id', $ticket->seat_id)
            ->update([
                'status' => 'AVAILABLE', // Chuyển từ OCCUPIED về AVAILABLE
                'ticket_id' => null,     // Xóa liên kết với vé cũ
                'updated_at' => now()
            ]);
    }
}