<?php
namespace App\Application\UseCases\Refund;
use Illuminate\Support\Facades\Mail;
use App\Models\BookingRequest;
use Illuminate\Support\Facades\DB;
use Exception;

use App\Mail\CustomerRequestStatusUpdatedMail;
class AdminRejectRefundUseCase
{

public function execute(int $requestId, int $adminId, string $reason): BookingRequest
{
    $request = DB::transaction(function () use ($requestId, $adminId, $reason) {
        
        $request = BookingRequest::with(['booking', 'ticket'])->lockForUpdate()->findOrFail($requestId);

        if ($request->status->value !== 'PENDING') {
            throw new Exception("Yêu cầu này đã được xử lý, không thể từ chối.");
        }

        // Khôi phục trạng thái vé về PAID vì không hoàn nữa
        $request->ticket->update(['status' => 'ACTIVE']);

        // Cập nhật trạng thái từ chối
        $request->update([
            'status' => 'REJECTED',
            'staff_id' => $adminId,
            'staff_note' => $reason,
            'processed_at' => now(),
        ]);

        return $request;
    });

    // GỬI MAIL THÔNG BÁO TỪ CHỐI
    if ($request->booking->contact_email) {
        Mail::to($request->booking->contact_email)
            ->queue(new CustomerRequestStatusUpdatedMail($request));
    }

    return $request;
}
}