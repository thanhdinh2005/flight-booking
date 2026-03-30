<?php

namespace App\Application\UseCases;

use App\Models\Booking;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail; // Thêm dòng này
use App\Mail\BookingConfirmedMail;    // Thêm dòng này
use Exception;

class ConfirmPaymentUseCase
{
    public function execute(int $bookingId, string $paymentMethod, string $transactionId, float $amount)
    {
        return DB::transaction(function () use ($bookingId, $paymentMethod, $transactionId, $amount) {
            // 1. Tìm Booking và khóa bản ghi
            // Sửa: Load thêm các quan hệ cần thiết cho Email để tránh lỗi N+1
            $booking = Booking::with(['tickets.passenger', 'tickets.flight_instance.flightSchedule.route'])
                ->lockForUpdate()
                ->findOrFail($bookingId);

            if ($booking->status === 'PAID') {
                return $booking;
            }

            // 2. Cập nhật trạng thái Booking
            $booking->update([
                'status'     => 'PAID',
                //'paid_at'    => now(),
                'expires_at' => null,
            ]);

            // 3. Cập nhật tất cả các vé liên quan
            $booking->tickets()->update([
                'status' => 'ACTIVE'
            ]);

            // 4. Tạo giao dịch (Transaction)
            Transaction::create([
                'booking_id'             => $booking->id,
                'amount'                 => $amount,
                'type'                   => 'PAYMENT',
                'payment_method'         => $paymentMethod,
                'gateway_transaction_id' => $transactionId,
                'status'                 => 'SUCCESS',
            ]);

            // 5. GỬI MAIL XÁC NHẬN (THÊM ĐOẠN NÀY)
            // Đẩy vào queue để không làm chậm response thanh toán
            if ($booking->contact_email) {
                Mail::to($booking->contact_email)->queue(new BookingConfirmedMail($booking));
            }

            return $booking; // Lúc này tickets đã được load ở bước 1 rồi
        });
    }
}