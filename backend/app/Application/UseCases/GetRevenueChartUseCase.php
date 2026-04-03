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

        // Giới hạn khoảng thời gian query
        if ($start->diffInDays($end) > 60) {
            throw new \Exception("Chỉ hỗ trợ xuất biểu đồ tối đa 60 ngày.");
        }

        // 2. Query gộp Doanh thu theo từng ngày
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

        $labels = [];
        $grossData = [];
        $netData = [];

        $period = CarbonPeriod::create($start, $end);

        foreach ($period as $date) {
            $dateString = $date->format('Y-m-d');
            $displayDate = $date->format('d/m');  

            $gross = $payments[$dateString] ?? 0; 
            $refund = $refunds[$dateString] ?? 0;
            $net = $gross - $refund;

            $labels[] = $displayDate;
            $grossData[] = (float) $gross;
            $netData[] = (float) $net;
        }

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'name' => 'Doanh thu gộp',
                    'type' => 'bar',
                    'data' => $grossData
                ],
                [
                    'name' => 'Doanh thu thuần',
                    'type' => 'line',
                    'data' => $netData
                ]
            ]
        ];
    }
}