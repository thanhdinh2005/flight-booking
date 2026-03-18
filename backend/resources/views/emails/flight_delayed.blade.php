@extends('emails.layouts.airline')

@section('content')

<h3 style="color:#e37400">Flight Schedule Update</h3>

<p>Dear {{ $passenger_name }},</p>

<p>
Your flight schedule has been updated. Please review the updated information below.
</p>

@include('emails.components.flight-info')

<table width="100%" cellpadding="8" style="margin-top:15px;border-collapse:collapse">

<tr>
<td style="border:1px solid #ddd"><b>Previous Departure</b></td>
<td style="border:1px solid #ddd">{{ $old_departure_time }}</td>
</tr>

<tr>
<td style="border:1px solid #ddd"><b>New Departure</b></td>
<td style="border:1px solid #ddd">{{ $new_departure_time }}</td>
</tr>

</table>

<p style="margin-top:20px">
We apologize for the inconvenience caused by this delay.
</p>

<p>
Thank you for choosing our airline.
</p>

@endsection