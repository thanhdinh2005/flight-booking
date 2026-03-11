<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#f5f5f5;padding:20px">

<table width="600" align="center" style="background:white;padding:30px;border-radius:8px">

<tr>
<td>

<h2 style="color:#d93025">Flight Cancellation Notice</h2>

<p>Dear {{ $passenger_name }},</p>

<p>
We regret to inform you that your scheduled flight has been cancelled.
</p>

<table width="100%" style="border-collapse:collapse;margin-top:20px">

<tr>
<td style="border:1px solid #ddd;padding:8px"><b>Flight Number</b></td>
<td style="border:1px solid #ddd;padding:8px">{{ $flight_number }}</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:8px"><b>Route</b></td>
<td style="border:1px solid #ddd;padding:8px">{{ $departure }} → {{ $arrival }}</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:8px"><b>Departure Time</b></td>
<td style="border:1px solid #ddd;padding:8px">{{ $departure_time }}</td>
</tr>

<tr>
<td style="border:1px solid #ddd;padding:8px"><b>Booking Code</b></td>
<td style="border:1px solid #ddd;padding:8px">{{ $booking_code }}</td>
</tr>

</table>

<p style="margin-top:20px">
Please contact our customer support to rebook another flight or request a refund.
</p>

<p>
Best regards,<br>
<b>{{ config('app.name') }}</b>
</p>

</td>
</tr>

</table>

</body>
</html>