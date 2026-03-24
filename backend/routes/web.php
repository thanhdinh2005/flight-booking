<?php
use App\Models\Booking;
use App\Mail\BookingConfirmedMail;

Route::get('/test-mail', function () {
    // 1. Lấy dữ liệu booking đầu tiên trong DB để đổ vào giao diện
    // Chúng ta load kèm các quan hệ để tránh lỗi "Undefined variable" trong file Blade
    $booking = Booking::with([
        'tickets.passenger', 
        'tickets.flight_instance.route.origin', 
        'tickets.flight_instance.route.destination',
        'tickets.flight_instance.flightSchedule',
    ])->first();

    if (!$booking) {
        return "Bạn chưa có dữ liệu Booking nào trong Database để hiển thị!";
    }

    // 2. Trả về (return) trực tiếp Mail object
    // Laravel sẽ tự hiểu và render nội dung HTML ra trình duyệt cho bạn xem
    return new BookingConfirmedMail($booking);
});