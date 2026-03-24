<table width="100%" cellpadding="10" cellspacing="0" style="border-collapse:collapse;">
    <tr>
        <td style="border-bottom:1px solid #eee; color: #666;" width="35%">Số hiệu chuyến bay</td>
        <td style="border-bottom:1px solid #eee;">
            <b>{{ $ticket->flight_instance?->flightSchedule?->flight_number ?? '-' }}</b>
        </td>
    </tr>
    <tr>
        <td style="border-bottom:1px solid #eee; color: #666;">Hành trình</td>
        <td style="border-bottom:1px solid #eee;">
            {{ $ticket->flight_instance?->route?->origin?->city }} 
            → 
            {{ $ticket->flight_instance?->route?->destination?->city }}
        </td>
    </tr>
    <tr>
        <td style="border-bottom:1px solid #eee; color: #666;">Khởi hành</td>
        <td style="border-bottom:1px solid #eee;">
            {{ $ticket->flight_instance?->std ? \Carbon\Carbon::parse($ticket->flight_instance->std)->format('H:i d/m/Y') : '-' }}
        </td>
    </tr>
    <tr>
        <td style="border:none; color: #666;">Hạng vé / Chỗ ngồi</td>
        <td style="border:none;">
            {{ $ticket->ticket_type ?? 'Phổ thông' }} 
            {{ $ticket->seat_number ? '(Ghế: ' . $ticket->seat_number . ')' : '' }}
        </td>
    </tr>
</table>