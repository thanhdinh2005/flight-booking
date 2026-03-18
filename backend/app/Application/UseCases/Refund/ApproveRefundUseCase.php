<?php

namespace App\Application\UseCases\Refund;

use App\Models\BookingRequest;
use App\Models\Ticket;
use App\Application\Command\RefundTicket\CalculateRefundAmountCommand;
use App\Application\Command\RefundTicket\CheckRefundEligibilityCommand;
use Illuminate\Support\Facades\DB;

class ApproveRefundUseCase
{
    protected $calculateCommand;
    protected $checkEligibilityCommand;

    public function __construct(
        CalculateRefundAmountCommand $calculateCommand,
        CheckRefundEligibilityCommand $checkEligibilityCommand
    ) {
        $this->calculateCommand = $calculateCommand;
        $this->checkEligibilityCommand = $checkEligibilityCommand;
    }

    public function execute(int $requestId, ?float $customAmount = null, ?string $adminReason = null)
    {
        return DB::transaction(function () use ($requestId, $customAmount, $adminReason) {
            $request = BookingRequest::findOrFail($requestId);
            
            if ($request->status !== 'PENDING') {
                throw new \Exception("Yêu cầu này đã được xử lý trước đó.");
            }

            $ticket = Ticket::with(['flightInstance', 'booking'])->lockForUpdate()->findOrFail($request->ticket_id);

            // 1. Kiểm tra điều kiện (vẫn phải check thời gian bay)
            $this->checkEligibilityCommand->execute($ticket);

            // 2. Tính toán tiền theo hệ thống để đối chiếu
            $systemPricing = $this->calculateCommand->execute($ticket);
            $systemAmount = $systemPricing['total_refund_amount'];

            // 3. Quyết định số tiền hoàn cuối cùng
            $finalRefundAmount = $systemAmount;
            
            if ($customAmount !== null) {
                // Kiểm tra nếu có nhập tiền riêng thì bắt buộc phải có lý do
                if (empty($adminReason)) {
                    throw new \Exception("Bắt buộc phải nhập lý do khi thay đổi số tiền hoàn trả.");
                }
                
                // Kiểm tra không cho hoàn vượt quá số tiền khách đã trả (Original Price + Addons)
                $maxPossible = $systemPricing['original_ticket_price'] + $systemPricing['addons_total_price'];
                if ($customAmount > $maxPossible) {
                    throw new \Exception("Số tiền hoàn không được vượt quá tổng giá trị vé và dịch vụ (" . number_format($maxPossible) . " VND).");
                }

                $finalRefundAmount = $customAmount;
            }

            // 4. Cập nhật Booking (Trừ tiền thực tế)
            $booking = $ticket->booking;
            $booking->update([
                'total_amount' => max(0, $booking->total_amount - $finalRefundAmount)
            ]);

            // 5. Cập nhật trạng thái vé và giải phóng ghế
            $ticket->update(['status' => 'REFUNDED']);
            $ticket->flightInstance->increment('available_seats');

            // 6. Cập nhật Request (Lưu cả tiền hệ thống và tiền thực tế để đối soát)
            $request->update([
                'status' => 'APPROVED',
                'system_refund_amount' => $systemAmount, // Tiền máy tính
                'refund_amount' => $finalRefundAmount,   // Tiền thực tế Admin chốt
                'staff_id' => auth()->id(),
                'staff_note' => $adminReason,
                'processed_at' => now()
            ]);

            return $request;
        });
    }
}