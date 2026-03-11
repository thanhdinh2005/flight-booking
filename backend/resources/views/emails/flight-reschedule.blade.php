@extends('emails.layouts.airline')

@section('content')

<h3 style="color:#e37400">Cập nhật lịch trình bay</h3>

<p>Dear {{ $passenger_name }},</p>

<p>
Chuyến bay của bạn đã được cập nhật.
</p>

@include('emails.components.flight-info')

<table width="100%" cellpadding="8" style="margin-top:15px;border-collapse:collapse">

<tr>
<td style="border:1px solid #ddd"><b>Giờ bay cũ</b></td>
<td style="border:1px solid #ddd">{{ $old_departure_time }}</td>
</tr>

<tr>
<td style="border:1px solid #ddd"><b>Giờ khởi hành mới</b></td>
<td style="border:1px solid #ddd">{{ $new_departure_time }}</td>
</tr>

</table>

@endsection