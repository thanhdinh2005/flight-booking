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
        // 1. Khóa Booking ngay từ đầu để bảo đảm tính nhất quán của Total Amount
        $ticket = Ticket::with('booking')->lockForUpdate()->findOrFail($ticketId);
        $booking = $ticket->booking;
        $addon = Addon::findOrFail($addonId);

        // 2. Tìm bản ghi Addon hiện tại
        $ticketAddon = TicketAddon::where('ticket_id', $ticketId)
            ->where('addon_id', $addonId)
            ->first();

        $oldQuantity = $ticketAddon ? $ticketAddon->quantity : 0;

        // Nếu số lượng mới giống hệt số lượng cũ -> Không làm gì cả
        if ($newQuantity === $oldQuantity) {
            return [
                'message' => 'No changes made', 
                'booking_total' => $booking->total_amount
            ];
        }

        // 3. Tính toán chênh lệch
        $diffAmount = ($newQuantity - $oldQuantity) * $addon->price;

        // 4. Thực hiện thay đổi Database
        if ($newQuantity > 0) {
            // Cập nhật hoặc Tạo mới
            TicketAddon::updateOrCreate(
                ['ticket_id' => $ticketId, 'addon_id' => $addonId],
                ['quantity' => $newQuantity, 'amount' => $addon->price]
            );
        } else {
            // Xóa bản ghi (Chỉ chạy khi oldQuantity > 0 vì đã check ở trên)
            if ($ticketAddon) {
                $ticketAddon->delete();
            }
        }

        // 5. Cập nhật tiền vào Booking
        $booking->increment('total_amount', $diffAmount);

        return [
            'ticket_id'    => $ticketId,
            'addon_id'     => $addonId,
            'status'       => $newQuantity > 0 ? 'UPDATED' : 'REMOVED',
            'new_quantity' => $newQuantity,
            'diff_amount'  => $diffAmount,  
            'booking_total'=> $booking->fresh()->total_amount
        ];
    });
}
}