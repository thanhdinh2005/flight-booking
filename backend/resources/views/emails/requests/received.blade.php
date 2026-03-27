@extends('emails.layouts.airline')

@section('content')
    <div style="margin-bottom: 20px;">
        <h2 style="color: #0f62fe; text-align: center;">XÁC NHẬN TIẾP NHẬN YÊU CẦU HOÀN VÉ</h2>
        <p>Chào bạn,</p>
        <p>Hệ thống đã nhận được yêu cầu hoàn vé cho mã đặt chỗ <b>{{ $requestData->booking->pnr }}</b> của bạn.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0f62fe; margin: 20px 0;">
            <p style="margin: 5px 0;"><b>Mã yêu cầu:</b> #{{ $requestData->id }}</p>
            <p style="margin: 5px 0;"><b>Số tiền hoàn dự kiến:</b> {{ number_format($requestData->refund_amount) }} VND</p>
            <p style="margin: 5px 0;"><b>Lý do:</b> {{ $requestData->reason }}</p>
            <p style="margin: 5px 0;"><b>Trạng thái:</b> <span style="color: #f39c12;">ĐANG CHỜ XỬ LÝ</span></p>
        </div>

        <p>Đội ngũ của chúng tôi sẽ xem xét yêu cầu này trong vòng 24h - 48h làm việc. Bạn sẽ nhận được email thông báo ngay khi có kết quả duyệt từ Admin.</p>
    </div>

    <div style="margin-top: 25px; padding: 10px; border: 1px solid #eee; font-size: 12px; color: #777;">
        * Lưu ý: Số tiền hoàn thực tế có thể thay đổi tùy thuộc vào chính sách hạng vé và thời điểm phê duyệt.
    </div>
@endsection