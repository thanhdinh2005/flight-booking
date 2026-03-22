<?php
namespace App\Application\UseCases\Refund;

use App\Models\BookingRequest;
use App\Models\Ticket;
use App\Models\FlightSeatInventory; // Giả sử đây là bảng quản lý chỗ ngồi
use Illuminate\Support\Facades\DB;
use Exception;

class AdminApproveRefundUseCase
{
    

public function execute(int $requestId, float $finalAmount, int $adminId, ?string $note = null): BookingRequest
{
    return DB::transaction(function () use ($requestId, $finalAmount, $adminId, $note) {
        
        // 1. Load Ticket kèm theo Addons để tính tổng tiền
        $request = BookingRequest::with(['ticket.addons', 'booking'])->lockForUpdate()->findOrFail($requestId);
        $ticket = $request->ticket;
        if (!$ticket) {
            throw new Exception("Yêu cầu hoàn tiền không đi kèm với vé hợp lệ.");
        }
        
        $booking = $ticket->booking;
        // 2. Tính tổng giá trị thực tế (Giá vé + Tổng tiền Addons)
        $addonsTotal = $ticket->addons->sum(function($addon) {
            return (float) $addon->price * $addon->quantity; 
        });
        
        

        // 3. Kiểm tra tính hợp lệ với Tổng giá trị mới
        if ($finalAmount > $request->system_refund_amount) {
            throw new Exception(
                "Số tiền hoàn (" . number_format($finalAmount) . ") không được vượt quá tổng giá trị vé và dịch vụ đi kèm (" . number_format($request->system_refund_amount) . ")."
            );
        }
// Bổ sung: Kiểm tra số tiền hoàn không được lớn hơn số tiền còn lại trong Booking
if ($finalAmount > $booking->total_amount) {
    throw new Exception("Số tiền hoàn (" . number_format($finalAmount) . ") không được vượt quá tổng giá trị còn lại của đơn hàng (" . number_format($booking->total_amount) . ").");
}
        // ... Các bước update trạng thái tiếp theo giữ nguyên ...
        $request->update([
            'status' => 'APPROVED',
            'refund_amount' => $finalAmount,
            'staff_id' => $adminId,
            'staff_note' => $note,
            'processed_at' => now(),
        ]);
        // Giảm tổng tiền của đơn hàng tương ứng với số tiền Admin quyết định hoàn trả
$booking->decrement('total_amount', $finalAmount);        // Nếu sau khi hoàn, tổng tiền nhỏ hơn 0 (lỗi logic dữ liệu), trả về lỗi
        if ($booking->total_amount < 0) {
    $booking->update(['total_amount' => 0]);
}


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
    // 1. Lấy dữ liệu từ Model Ticket (đúng tên cột seat_class)
    $seatClass = $ticket->seat_class;
    $instanceId = $ticket->flight_instance_id;

    // Kiểm tra nếu thiếu dữ liệu thì dừng lại ngay
    if (!$seatClass || !$instanceId) {
        return;
    }

    // 2. Tìm bản ghi trong kho ghế
    // Lưu ý: Dùng Model FlightSeatInventory để an toàn hơn DB::table
    $inventory = \App\Models\FlightSeatInventory::where('flight_instance_id', $instanceId)
        ->where('seat_class', $seatClass)
        ->first();

    if ($inventory) {
        // 3. Tăng số lượng ghế trống lên 1
        $inventory->increment('available_seats');
    }
}
}