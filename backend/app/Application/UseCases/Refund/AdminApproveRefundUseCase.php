<?php

namespace App\Application\UseCases\Refund;

use App\Models\BookingRequest;
use App\Models\Ticket;
use App\Models\FlightSeatInventory;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Mail;
use App\Mail\CustomerRequestStatusUpdatedMail;
use App\Exceptions\EntityNotFoundException;
class AdminApproveRefundUseCase
{
    public function execute(int $requestId, float $finalAmount, int $adminId, ?string $note = null): BookingRequest
    {
        // QUAN TRỌNG: Gán kết quả của transaction vào biến $request ở bên ngoài
        $request = DB::transaction(function () use ($requestId, $finalAmount, $adminId, $note) {
            
            // 1. Load dữ liệu và khóa dòng
            $requestObj = BookingRequest::with(['ticket.addons', 'booking'])->lockForUpdate()->findOrFail($requestId);
            $ticket = $requestObj->ticket;
            if($ticket->status->value != "ACTIVE"){
                throw new EntityNotFoundException("Yêu cầu này đã được xử lý, không thể từ chối.");
            }
            if (!$ticket) {
                throw new Exception("Yêu cầu hoàn tiền không đi kèm với vé hợp lệ.");
            }
            
            $booking = $ticket->booking;

            // 2. Kiểm tra tính hợp lệ của số tiền hoàn
            if ($finalAmount > $requestObj->system_refund_amount) {
                throw new Exception(
                    "Số tiền hoàn (" . number_format($finalAmount) . ") vượt quá giá trị hệ thống tính toán."
                );
            }

            if ($finalAmount > $booking->total_amount) {
                throw new Exception("Số tiền hoàn vượt quá tổng giá trị còn lại của đơn hàng.");
            }

            // 3. Cập nhật trạng thái Yêu cầu
            $requestObj->update([
                'status' => 'APPROVED',
                'refund_amount' => $finalAmount,
                'staff_id' => $adminId,
                'staff_note' => $note,
                'processed_at' => now(),
            ]);

            // 4. Giảm tổng tiền đơn hàng
            $booking->decrement('total_amount', $finalAmount);
            if ($booking->total_amount < 0) {
                $booking->update(['total_amount' => 0]);
            }

            // 5. Cập nhật vé và giải phóng ghế
            $ticket->update(['status' => 'REFUNDED']);
            $this->releaseSeat($ticket);

            return $requestObj; // Trả về object để biến bên ngoài nhận được
        });

        // BƯỚC 6: GỬI MAIL (Nằm ngoài Transaction)
        // Lúc này $request đã tồn tại vì được gán từ kết quả DB::transaction
        if ($request && $request->booking && $request->booking->contact_email) {
            // Load lại quan hệ để đảm bảo dữ liệu mới nhất (status đã là APPROVED)
            $request->load('booking'); 
            
            Mail::to($request->booking->contact_email)
                ->queue(new CustomerRequestStatusUpdatedMail($request));
        }

        return $request;
    }

    private function releaseSeat(Ticket $ticket)
    {
        $seatClass = $ticket->seat_class;
        $instanceId = $ticket->flight_instance_id;

        if (!$seatClass || !$instanceId) return;

        $inventory = FlightSeatInventory::where('flight_instance_id', $instanceId)
            ->where('seat_class', $seatClass)
            ->first();

        if ($inventory) {
            $inventory->increment('available_seats');
        }
    }
}