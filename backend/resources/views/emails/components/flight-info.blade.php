<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin-top:15px">

<tr>
<td style="border:1px solid #ddd"><b>Flight</b></td>
<td style="border:1px solid #ddd">{{ $flight_number }}</td>
</tr>

<tr>
<td style="border:1px solid #ddd"><b>Route</b></td>
<td style="border:1px solid #ddd">{{ $departure }} → {{ $arrival }}</td>
</tr>

<tr>
<td style="border:1px solid #ddd"><b>Departure</b></td>
<td style="border:1px solid #ddd">{{ $departure_time }}</td>
</tr>

<tr>
<td style="border:1px solid #ddd"><b>Passenger</b></td>
<td style="border:1px solid #ddd">{{ $passenger_name }}</td>
</tr>

<tr>
<td style="border:1px solid #ddd"><b>Booking Code</b></td>
<td style="border:1px solid #ddd">{{ $booking_code }}</td>
</tr>

</table>