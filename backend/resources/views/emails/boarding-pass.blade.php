@extends('emails.layouts.airline')

@section('content')
    <div style="margin-bottom: 20px;">
        <h2 style="color: #0f62fe; text-align: center;">THẺ LÊN MÁY BAY ĐIỆN TỬ</h2>
        <p>Chào bạn,</p>
        <p>Bạn đã thực hiện check-in thành công. Dưới đây là thẻ lên máy bay của hành khách cho mã đặt chỗ <b>{{ $ticket->booking->pnr }}</b>.</p>
    </div>  

    <div style="margin-top: 20px; border: 1px solid #eee; border-left: 5px solid #e63946; border-radius: 4px; overflow: hidden;">
        <div style="background-color: #fff5f5; padding: 10px 15px; font-weight: bold; color: #333;">
            HÀNH KHÁCH: {{ strtoupper($ticket->passenger?->last_name . ' ' . $ticket->passenger?->first_name) }}
        </div>
        
        {{-- Phần thông tin chi tiết thẻ lên máy bay --}}
        <div style="padding: 15px;">
            <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td width="33%">
                        <div style="font-size: 11px; color: #888;">CHỖ NGỒI</div>
                        <div style="font-size: 24px; font-weight: bold; color: #0f62fe;">{{ $ticket->seat_number }}</div>
                    </td>
                    <td width="33%" style="text-align: center;">
                        <div style="font-size: 11px; color: #888;">HẠNG VÉ</div>
                        <div style="font-size: 16px; font-weight: bold;">{{ $ticket->seat_class }}</div>
                    </td>
                    <td width="33%" style="text-align: right;">
                        <div style="font-size: 11px; color: #888;">CỬA</div>
                        <div style="font-size: 16px; font-weight: bold;">TBA</div>
                    </td>
                </tr>
            </table>

            <div style="margin-top: 15px; text-align: center; border-top: 1px dashed #ddd; padding-top: 15px;">
                {{-- Bạn có thể dùng component flight-info cũ hoặc tạo riêng cho checkin --}}
                @include('emails.components.flight-info', ['ticket' => $ticket])
            </div>

            <div style="margin-top: 20px; text-align: center;">
                <p style="font-size: 12px; color: #888;">Quét mã QR dưới đây để qua cửa an ninh:</p>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={{ $ticket->booking->pnr }}-{{ $ticket->id }}" 
                     alt="QR Boarding Pass" 
                     style="border: 1px solid #eee; padding: 10px;">
            </div>
        </div>
    </div>

    <div style="margin-top: 25px; padding: 15px; background-color: #fff9f9; border-left: 4px solid #e63946;">
        <p style="margin: 0; font-size: 13px; color: #333;">
            <b>Lưu ý dành cho hành khách:</b><br>
            - Vui lòng có mặt tại cửa khởi hành trước <b>{{ \Carbon\Carbon::parse($ticket->flight_instance->departure_time)->subMinutes(30)->format('H:i') }}</b>.<br>
            - Thẻ lên máy bay này có giá trị thay cho vé giấy.<br>
            - Đảm bảo điện thoại của bạn đủ pin để xuất trình mã QR khi cần thiết.
        </p>
    </div>

    <p style="margin-top: 25px; text-align: center; font-weight: bold; color: #0f62fe;">Chúc bạn có một trải nghiệm bay tuyệt vời!</p>
@endsection