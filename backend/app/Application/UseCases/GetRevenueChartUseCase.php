<?php

namespace App\Application\UseCases;

use App\Models\Transaction;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class GetRevenueChartUseCase
{
    public function execute(?string $startDate, ?string $endDate): array
    {
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::now()->subDays(6)->startOfDay();
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::now()->endOfDay();

        // Giới hạn khoảng thời gian query (Ví dụ: Tối đa 60 ngày để tránh quá tải biểu đồ)
        if ($start->diffInDays($end) > 60) {
            throw new \Exception("Chỉ hỗ trợ xuất biểu đồ tối đa 60 ngày.");
        }

        // 2. Query gộp (Aggregate) Doanh thu theo từng ngày
        // Hàm pluck('total', 'date') sẽ trả về mảng dạng Key-Value: ['2026-03-01' => 15000000, ...]
        $payments = Transaction::selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->where('type', 'PAYMENT')
            ->where('status', 'SUCCESS')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('date')
            ->pluck('total', 'date');

        // 3. Query gộp Tiền hoàn theo từng ngày
        $refunds = Transaction::selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->where('type', 'REFUND')
            ->where('status', 'SUCCESS')
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('date')
            ->pluck('total', 'date');

        // 4. Khởi tạo mảng kết quả
        $labels = [];
        $grossData = [];
        $netData = [];

        // 5. Tạo một vòng lặp quét qua TẤT CẢ các ngày từ start đến end (Lấp lỗ hổng ngày 0đ)
        $period = CarbonPeriod::create($start, $end);

        foreach ($period as $date) {
            $dateString = $date->format('Y-m-d'); // Dùng làm key để map với mảng query
            $displayDate = $date->format('d/m');  // Dùng để hiển thị ở trục X biểu đồ (VD: 15/03)

            $gross = $payments[$dateString] ?? 0; // Nếu ngày đó không có trong DB thì gán = 0
            $refund = $refunds[$dateString] ?? 0;
            $net = $gross - $refund;

            $labels[] = $displayDate;
            $grossData[] = (float) $gross;
            $netData[] = (float) $net;
        }

        // 6. Format lại chuẩn cấu trúc cho các thư viện Chart (Chart.js, ApexCharts, Recharts...)
        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'name' => 'Doanh thu gộp',
                    'type' => 'bar', // Frontend có thể dùng để render biểu đồ cột
                    'data' => $grossData
                ],
                [
                    'name' => 'Doanh thu thuần',
                    'type' => 'line', // Frontend có thể dùng để render biểu đồ đường
                    'data' => $netData
                ]
            ]
        ];
    }
}