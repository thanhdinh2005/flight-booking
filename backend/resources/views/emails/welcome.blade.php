<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome</title>
</head>

<body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0">

<tr>
<td align="center">

<table width="620" cellpadding="0" cellspacing="0" style="background:white;border-radius:8px;overflow:hidden">

<!-- HEADER -->
<tr>
<td style="background:#0f62fe;color:white;padding:25px;text-align:center">

<h2 style="margin:0">
Welcome to {{ config('app.name') }}
</h2>

</td>
</tr>

<!-- CONTENT -->
<tr>
<td style="padding:35px;color:#333">

<p>Hello <b>{{ $user_name }}</b>,</p>

<p>
Welcome to <b>{{ config('app.name') }}</b>.  
We’re excited to have you on board.
</p>

<p>
Your account has been successfully created and you can now start using our platform.
</p>

<!-- Account info -->
<table width="100%" style="border-collapse:collapse;margin-top:20px">

<tr>
<td style="border:1px solid #ddd;padding:10px"><b>Email</b></td>
<td style="border:1px solid #ddd;padding:10px">{{ $email }}</td>
</tr>

</table>

<!-- CTA -->
<div style="text-align:center;margin-top:30px">

</div>

<p style="margin-top:30px">
If you have any questions, feel free to contact our support team.
</p>

<p>
Best regards,<br>
<b>{{ config('app.name') }} Team</b>
</p>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background:#f1f3f4;padding:20px;text-align:center;font-size:12px;color:#666">

© {{ date('Y') }} {{ config('app.name') }}

<br>

This email was sent automatically. Please do not reply.

</td>
</tr>

</table>

</td>
</tr>

</table>

</body>
</html>