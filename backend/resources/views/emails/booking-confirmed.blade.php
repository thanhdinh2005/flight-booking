@extends('emails.layouts.airline')

@section('content')
    <div style="margin-bottom: 20px;">
        <h2 style="color: #0f62fe; text-align: center;">THANH TOÁN THÀNH CÔNG</h2>
        <p>Chào bạn,</p>
        <p>Hệ thống đã ghi nhận thanh toán cho mã đặt chỗ <b style="font-size: 18px; color: #0f62fe;">{{ $booking->pnr }}</b>.</p>
        <p>Email liên hệ: <b>{{ $booking->contact_email }}</b></p>
        <p>Dưới đây là thông tin chi tiết các hành khách và hành trình trong đơn hàng của bạn:</p>
    </div>  

    {{-- Vòng lặp hiển thị từng vé trong booking --}}
    @foreach($booking->tickets as $index => $ticket)
        <div style="margin-top: 20px; border: 1px solid #eee; border-left: 5px solid #0f62fe; border-radius: 4px; overflow: hidden;">
            <div style="background-color: #f1f6ff; padding: 10px 15px; font-weight: bold; color: #333;">
                HÀNH KHÁCH {{ $index + 1 }}: {{ strtoupper($ticket->passenger?->last_name . ' ' . $ticket->passenger?->first_name) }}
            </div>
            
            {{-- Truyền từng $ticket vào component --}}
            @include('emails.components.flight-info', ['ticket' => $ticket])
        </div>
    @endforeach

    <div style="margin-top: 25px; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #0f62fe;">
        <p style="margin: 0; font-size: 13px;">
            <b>Lưu ý quan trọng:</b><br>
            - Vui lòng xuất trình email này hoặc mã <b>PNR: {{ $booking->pnr }}</b> khi làm thủ tục.<br>
            - Có mặt trước giờ khởi hành ít nhất 120 phút để làm thủ tục check-in.<br>
            - Đảm bảo giấy tờ tùy thân còn hiệu lực.
        </p>
    </div>

    <p style="margin-top: 25px; text-align: center; font-weight: bold; color: #0f62fe;">Chúc bạn có một chuyến bay tốt đẹp!</p>
@endsection