<?php

namespace App\Application\Command\RefundTicket;

use App\Models\Ticket;
use Illuminate\Support\Facades\DB;

class CalculateRefundAmountCommand
{
    const REFUND_FEE_PERCENTAGE_BUSINESS = 0.1; // Phí 10%
    const REFUND_FEE_PERCENTAGE_ECONOMY = 0.2;  // Phí 20%

    public function execute(Ticket $ticket): array
    {
        // 1. Lấy giá vé gốc
        $originalPrice = $ticket->ticket_price;

        // 2. Tính phí hoàn vé (Ticket Fee) dựa trên hạng ghế
        if ($ticket->seat_class === 'ECONOMY') {
            $fee = $originalPrice * self::REFUND_FEE_PERCENTAGE_ECONOMY;
        } else {
            $fee = $originalPrice * self::REFUND_FEE_PERCENTAGE_BUSINESS;
        }

        // 3. Số tiền hoàn của riêng vé (đã trừ phí)
        $ticketRefund = max(0, $originalPrice - $fee);

        // 4. Truy vấn tổng tiền Addons từ bảng ticket_addons
        // Ép kiểu (float) để đảm bảo tính toán chính xác
        $addonTotal = (float) DB::table('ticket_addons')
            ->where('ticket_id', $ticket->id)
            ->sum(DB::raw('amount * quantity')) ?? 0;

        // 5. Tổng số tiền khách nhận lại (Vé + 100% Addons)
        $totalRefundAmount = $ticketRefund + $addonTotal;

        return [
            'original_ticket_price' => (float) $originalPrice,
            'addons_total_price'    => $addonTotal,
            'ticket_refund_amount'  => (float) $ticketRefund,
            'total_refund_amount'   => (float) $totalRefundAmount,
            'refund_fee'            => (float) $fee,
            'currency'              => 'VND'
        ];
    }
}