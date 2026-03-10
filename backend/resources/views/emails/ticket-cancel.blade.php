@extends('emails.layouts.airline')

@section('content')

<h3 style="color:#d93025">Hủy vé</h3>

<p>Dear {{ $passenger_name }},</p>

<p>
Vé của bạn đã được hủy thành công.
</p>

@include('emails.components.flight-info')

<p style="margin-top:20px">

Nếu việc hủy này không phải do bạn yêu cầu, vui lòng liên hệ ngay với bộ phận hỗ trợ.

</p>

@endsection