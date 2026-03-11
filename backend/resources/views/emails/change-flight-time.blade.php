@extends('emails.layouts.airline')

@section('content')

<h3>Cập nhật giờ bay mới</h3>

<p>Dear {{ $passenger_name }},</p>

<p>
Chuyến bay của bạn đã được cập nhật thời gian.
</p>

@include('emails.components.flight-info')

<p style="margin-top:20px">

Thời gian bay mới:  
<b>{{ $new_departure_time }}</b>

</p>

@endsection