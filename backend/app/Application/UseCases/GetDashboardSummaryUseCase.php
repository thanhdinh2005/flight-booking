<?php

namespace App\Application\UseCases;

use App\Models\Transaction;
use App\Models\Booking;
use App\Models\FlightInstance;
use Carbon\Carbon;

class GetDashboardSummaryUseCase
{
    public function execute(?string $startDate, ?string $endDate): array
    {
        
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::now()->startOfMonth();
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::now()->endOfDay();

        $grossRevenue = Transaction::where('type', 'PAYMENT')
            ->where('status', 'SUCCESS')
            ->whereBetween('created_at', [$start, $end])
            ->sum('amount');

        $refundedAmount = Transaction::where('type', 'REFUND')
            ->where('status', 'SUCCESS')
            ->whereBetween('created_at', [$start, $end])
            ->sum('amount');

        $netRevenue = $grossRevenue - $refundedAmount;

        $totalBookings = Booking::whereIn('status', ['PAID', 'CONFIRMED'])
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $totalFlights = FlightInstance::whereBetween('std', [$start, $end])
            ->where('status', 'ARRIVED')
            ->count();

        return [
            'period' => [
                'start_date' => $start->format('Y-m-d'),
                'end_date' => $end->format('Y-m-d'),
            ],
            'financials' => [
                'gross_revenue' => (float) $grossRevenue,
                'refunded_amount' => (float) $refundedAmount,
                'net_revenue' => (float) $netRevenue,
            ],
            'operations' => [
                'total_bookings' => $totalBookings,
                'total_flights' => $totalFlights,
            ]
        ];
    }
}