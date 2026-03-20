<?php
namespace App\Application\UseCases;

use App\Models\Booking;
use App\Models\Ticket;
use Illuminate\Support\Facades\DB;
use Exception;

class ConfirmPaymentUseCase
{
    /**
     * Xác nhận thanh toán thành công
     *
     * @param int $bookingId
     * @param string $paymentMethod (VNPAY, MOMO, STRIPE...)
     * @param string $transactionId (Mã giao dịch từ nhà cung cấp)
     */
    public function execute(int $bookingId, string $paymentMethod, string $transactionId)
    {
        return DB::transaction(function () use ($bookingId, $paymentMethod, $transactionId) {
            // 1. Tìm Booking và khóa để tránh update trùng lặp từ Webhook
            $booking = Booking::with('tickets')->lockForUpdate()->findOrFail($bookingId);

            // Kiểm tra nếu đã thanh toán rồi thì không xử lý lại
            if ($booking->status === 'PAID') {
                return $booking;
            }

            // 2. Cập nhật trạng thái Booking
            $booking->update([
                'status' => 'PAID',
                'payment_method' => $paymentMethod,
                'transaction_id' => $transactionId,
                'paid_at' => now(),
            ]);

            // 3. Cập nhật tất cả các vé liên quan sang trạng thái ISSUED
            // Chỉ khi trạng thái là ISSUED thì khách mới có thể Verify Identity để Check-in
            $booking->tickets()->update([
                'status' => 'ISSUED'
            ]);

            // 4. (Tùy chọn) Gửi Email xác nhận kèm mặt vé/PNR cho khách hàng ở đây
            // Mail::to($booking->contact_email)->send(new BookingConfirmedMail($booking));

            return $booking->load('tickets');
        });
    }
}