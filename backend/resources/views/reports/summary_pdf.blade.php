<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Báo cáo hoạt động</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #333; line-height: 1.6; } /* DejaVu Sans hỗ trợ tiếng Việt tốt trong dompdf */
        .header { text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 10px; margin-bottom: 20px; }
        .title { font-size: 24px; font-weight: bold; color: #0056b3; text-transform: uppercase; }
        .period { font-size: 14px; color: #666; }
        .table-metrics { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table-metrics th, .table-metrics td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .table-metrics th { background-color: #f4f4f4; font-weight: bold; width: 50%; }
        .text-right { text-align: right !important; }
        .highlight { font-size: 18px; font-weight: bold; color: #d9534f; }
        .footer { margin-top: 50px; text-align: right; font-size: 12px; font-style: italic; }
    </style>
</head>
<body>

    <div class="header">
        <div class="title">Báo Cáo Hoạt Động Kính Doanh</div>
        <div class="period">Từ ngày: {{ $start_date }} - Đến ngày: {{ $end_date }}</div>
    </div>

    <h3>1. Chỉ số Tài chính</h3>
    <table class="table-metrics">
        <tr>
            <th>Tổng doanh thu (Gross Revenue)</th>
            <td class="text-right">{{ number_format($gross_revenue, 0, ',', '.') }} VNĐ</td>
        </tr>
        <tr>
            <th>Tổng tiền hoàn (Refunds)</th>
            <td class="text-right">{{ number_format($refunded_amount, 0, ',', '.') }} VNĐ</td>
        </tr>
        <tr>
            <th>Doanh thu thuần (Net Revenue)</th>
            <td class="text-right highlight">{{ number_format($net_revenue, 0, ',', '.') }} VNĐ</td>
        </tr>
    </table>

    <h3>2. Chỉ số Vận hành & Bán hàng</h3>
    <table class="table-metrics">
        <tr>
            <th>Tổng số đơn đặt chỗ thành công</th>
            <td class="text-right">{{ number_format($total_bookings) }} Đơn</td>
        </tr>
        <tr>
            <th>Tổng số chuyến bay khai thác</th>
            <td class="text-right">{{ number_format($total_flights) }} Chuyến</td>
        </tr>
    </table>

    <div class="footer">
        Báo cáo được xuất tự động từ hệ thống lúc: {{ $generated_at }}
    </div>

</body>
</html>