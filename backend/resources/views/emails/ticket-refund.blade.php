@extends('emails.layouts.airline')

@section('content')

<h3 style="color:#188038">Hoàn tiền Vé</h3>

<p>Dear {{ $passenger_name }},</p>

<p>
Giao dịch hoàn tiền vé của bạn đã được xử lý thành công.
</p>

@include('emails.components.flight-info')

<table width="100%" cellpadding="8" style="margin-top:15px;border-collapse:collapse">

<tr>
<td style="border:1px solid #ddd"><b>Số tiền hoàn trả</b></td>
<td style="border:1px solid #ddd">{{ $refund_amount }}</td>
</tr>

<tr>
<td style="border:1px solid #ddd"><b>Phương thức hoàn trả</b></td>
<td style="border:1px solid #ddd">{{ $refund_method }}</td>
</tr>

</table>

@endsection