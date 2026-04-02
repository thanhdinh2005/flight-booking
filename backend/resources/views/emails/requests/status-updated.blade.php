@extends('emails.layouts.airline')

@section('content')
    <div style="margin-bottom: 20px;">
        {{-- 1. Tiêu đề chính --}}
        @if($requestData->status->value === 'APPROVED')
            <h2 style="color: #28a745; text-align: center; text-transform: uppercase;">Yêu cầu hoàn vé đã được duyệt</h2>
        @else
            <h2 style="color: #dc3545; text-align: center; text-transform: uppercase;">Yêu cầu hoàn vé bị từ chối</h2>
        @endif

        <p>Chào bạn,</p>
        <p>InteractHub Airlines thông báo kết quả xử lý yêu cầu <b>#{{ $requestData->id }}</b> cho mã đặt chỗ <b>{{ $requestData->booking->pnr }}</b>:</p>
        
        {{-- 2. Box thông tin chi tiết --}}
        <div style="background-color: #f8f9fa; padding: 20px; border-left: 4px solid {{ $requestData->status->value === 'APPROVED' ? '#28a745' : '#dc3545' }}; margin: 20px 0; border-radius: 4px;">
            <p style="margin-top: 0;"><b>Trạng thái:</b> 
                <span style="font-weight: bold; color: {{ $requestData->status->value === 'APPROVED' ? '#28a745' : '#dc3545' }};">
                    {{ $requestData->status->value === 'APPROVED' ? 'ĐÃ PHÊ DUYỆT' : 'TỪ CHỐI' }}
                </span>
            </p>
            
            {{-- 3. Hiển thị nội dung tương ứng --}}
            @if($requestData->status->value === 'APPROVED')
                <p><b>Số tiền hoàn trả:</b> <span style="font-size: 20px; color: #28a745; font-weight: bold;">{{ number_format($requestData->refund_amount) }} VND</span></p>
                <p style="margin-bottom: 0;"><b>Phương thức:</b> Hoàn về tài khoản/thẻ thanh toán gốc (VNPAY).</p>
                <p style="font-size: 12px; color: #666; margin-top: 5px; font-style: italic;">
                    (Lưu ý: Tiền sẽ được ghi có vào tài khoản của bạn trong 7-14 ngày làm việc tùy theo quy trình hạch toán của Ngân hàng chủ quản).
                </p>
            @else
                <p style="margin-bottom: 5px;"><b>Lý do từ chối:</b></p>
                <div style="color: #dc3545; background: #fff; padding: 10px; border: 1px solid #ffcccc; border-radius: 4px;">
                    {{ $requestData->staff_note ?: 'Yêu cầu không thỏa mãn điều kiện hoàn vé của hãng.' }}
                </div>
                <p style="font-size: 12px; color: #666; margin-top: 10px; font-style: italic;">
                    (Vé của bạn vẫn có giá trị sử dụng cho chuyến bay sắp tới. Chúc bạn có một hành trình tốt đẹp!)
                </p>
            @endif
        </div>

        <p style="text-align: center; color: #888; font-size: 13px;">
            Đây là email tự động, vui lòng không phản hồi email này.
        </p>
    </div>
@endsection