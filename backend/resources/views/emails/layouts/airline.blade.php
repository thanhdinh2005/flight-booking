<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
</head>

<body style="margin:0;padding:0;background:#f5f7fa;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="620" cellpadding="0" cellspacing="0" style="background:white;border-radius:8px;overflow:hidden">

<!-- HEADER -->
<tr>
<td style="background:#0f62fe;padding:20px;text-align:center;color:white">

<h2 style="margin:0;">
{{ config('app.name') }}
</h2>

</td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:30px">

@yield('content')

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background:#f1f3f4;padding:20px;text-align:center;font-size:12px;color:#666">

Đây là Email tự động. Vui lòng không gửi email phản hồi.

<br>

© {{ date('Y') }} {{ config('app.name') }}

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>