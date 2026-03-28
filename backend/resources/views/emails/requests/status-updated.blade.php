@extends('emails.layouts.airline')

@section('content')
    <div style="margin-bottom: 20px;">
        {{-- 1. Tiêu đề chính --}}
        @if($requestData->status->value === 'APPROVED')
            <h2 style="color: #28a745; text-align: center;">YÊU CẦU HOÀN VÉ ĐÃ ĐƯỢC DUYỆT</h2>
        @else
            <h2 style="color: #dc3545; text-align: center;">YÊU CẦU HOÀN VÉ BỊ TỪ CHỐI</h2>
        @endif

        <p>Chào bạn,</p>
        <p>InteractHub Airlines thông báo kết quả xử lý yêu cầu #{{ $requestData->id }} cho mã đặt chỗ <b>{{ $requestData->booking->pnr }}</b>:</p>
        
        {{-- 2. Box thông tin chi tiết --}}
        {{-- Lưu ý: Mọi chỗ so sánh đều phải thêm ->value --}}
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid {{ $requestData->status->value === 'APPROVED' ? '#28a745' : '#dc3545' }}; margin: 20px 0;">
            <p><b>Trạng thái:</b> 
                <span style="font-weight: bold; color: {{ $requestData->status->value === 'APPROVED' ? '#28a745' : '#dc3545' }};">
                    {{ $requestData->status->value === 'APPROVED' ? 'ĐÃ PHÊ DUYỆT' : 'TỪ CHỐI' }}
                </span>
            </p>
            
            {{-- 3. Hiển thị nội dung tương ứng --}}
            @if($requestData->status->value === 'APPROVED')
                <p><b>Số tiền hoàn trả:</b> <span style="font-size: 18px; color: #28a745;">{{ number_format($requestData->refund_amount) }} VND</span></p>
                <p style="font-size: 12px; color: #666;">(Tiền sẽ được hoàn về tài khoản của bạn trong 7-14 ngày làm việc)</p>
            @else
                <p><b>Lý do từ chối:</b> <span style="color: #dc3545;">{{ $requestData->staff_note }}</span></p>
                <p style="font-size: 12px; color: #666;">(Vé của bạn vẫn có giá trị sử dụng cho chuyến bay sắp tới)</p>
            @endif
        </div>
    </div>
@endsection