<?php

namespace App\Application\Command\Pricing;

use App\Models\Ticket;
use App\Models\TicketAddon;
use App\Models\Addon;
use Illuminate\Support\Facades\DB;

class SyncAddonQuantityCommand
{
    public function execute(int $ticketId, int $addonId, int $newQuantity)
{
    return DB::transaction(function () use ($ticketId, $addonId, $newQuantity) {
        // 1. Lock dữ liệu để đảm bảo tính nhất quán
        $ticket = Ticket::with('booking')->lockForUpdate()->findOrFail($ticketId);
        $booking = $ticket->booking;
        
        // Lấy addon model - đã bao gồm cột 'type' và 'price'
        $addon = Addon::findOrFail($addonId);

        // 2. RÀNG BUỘC QUANTITY: Nếu không phải LUGGAGE thì chỉ cho phép 0 hoặc 1
        if ($addon->type !== 'LUGGAGE') {
            $newQuantity = $newQuantity > 0 ? 1 : 0;
        } else {
            // Giới hạn thực tế cho hành lý (ví dụ tối đa 3 kiện) để tránh spam
            $newQuantity = min($newQuantity, 3);
        }

        // 3. Tìm bản ghi Addon hiện tại của Ticket
        $ticketAddon = TicketAddon::where('ticket_id', $ticketId)
            ->where('addon_id', $addonId)
            ->first();

        $oldQuantity = $ticketAddon ? $ticketAddon->quantity : 0;

        // Nếu sau khi áp dụng ràng buộc mà số lượng không đổi -> Thoát sớm
        if ($newQuantity === $oldQuantity) {
            return [
                'message' => 'No changes made due to quantity constraints or identical value', 
                'booking_total' => $booking->total_amount
            ];
        }

        // 4. Tính toán chênh lệch dựa trên đơn giá
        $diffAmount = ($newQuantity - $oldQuantity) * $addon->price;

        // 5. Cập nhật Database
        if ($newQuantity > 0) {
            TicketAddon::updateOrCreate(
                ['ticket_id' => $ticketId, 'addon_id' => $addonId],
                ['quantity' => $newQuantity, 'amount' => $addon->price]
            );
        } else {
            if ($ticketAddon) $ticketAddon->delete();
        }

        // 6. Cập nhật tiền vào Booking
        $booking->increment('total_amount', $diffAmount);

        return [
            'ticket_id'    => $ticketId,
            'addon_type'   => $addon->type,
            'status'       => $newQuantity > 0 ? 'UPDATED' : 'REMOVED',
            'new_quantity' => $newQuantity,
            'diff_amount'  => $diffAmount,
            'booking_total'=> $booking->fresh()->total_amount
        ];
    });
}
}