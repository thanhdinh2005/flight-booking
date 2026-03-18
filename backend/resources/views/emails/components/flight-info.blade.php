<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin-top:15px">

<tr>
<td style="border:1px solid #ddd"><b>Flight</b></td>
<td style="border:1px solid #ddd">
{{ $booking->tickets->first()?->flight_instance?->flight_number ?? '-' }}
</td>
</tr>

<tr>
<td style="border:1px solid #ddd"><b>Route</b></td>
<td style="border:1px solid #ddd">
{{ $booking->tickets->first()?->flight_instance?->route?->origin?->city ?? '-' }}
 →
{{ $booking->tickets->first()?->flight_instance?->route?->destination?->city ?? '-' }}
</td>
</tr>

<tr>
<td style="border:1px solid #ddd"><b>Departure</b></td>
<td style="border:1px solid #ddd">
{{ \Carbon\Carbon::parse($booking->tickets->first()?->flight_instance?->std)->format('H:i d/m/Y') }}
</td>
</tr>

<tr>
<td style="border:1px solid #ddd"><b>Passenger</b></td>
<td style="border:1px solid #ddd">
{{ $passenger_name }}
</td>
</tr>

<tr>
<td style="border:1px solid #ddd"><b>Booking Code</b></td>
<td style="border:1px solid #ddd">
{{ $booking->pnr }}
</td>
</tr>

</table>