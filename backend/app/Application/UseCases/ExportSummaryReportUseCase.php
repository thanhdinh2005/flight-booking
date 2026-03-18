<?php

namespace App\Application\UseCases;

use App\Models\Booking;
use App\Models\FlightInstance;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class ExportSummaryReportUseCase
{
    public function execute(string $startDate, string $endDate)
    {
        // 1. Format lại ngày tháng để query chính xác từ 00:00:00 đến 23:59:59
        $start = Carbon::parse($startDate)->startOfDay();
        $end = Carbon::parse($endDate)->endOfDay();

        // 2. Query TÀI CHÍNH (Từ bảng transactions)
        $grossRevenue = Transaction::where('type', 'PAYMENT')
            ->where('status', 'SUCCESS')
            ->whereBetween('created_at', [$start, $end])
            ->sum('amount');

        $refundedAmount = Transaction::where('type', 'REFUND')
            ->where('status', 'SUCCESS')
            ->whereBetween('created_at', [$start, $end])
            ->sum('amount');

        $netRevenue = $grossRevenue - $refundedAmount;

        // 3. Query BÁN HÀNG & VẬN HÀNH
        $totalBookings = Booking::whereIn('status', ['CONFIRMED', 'PAID', 'COMPLETED'])
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $totalFlights = FlightInstance::whereBetween('std', [$start, $end])
            ->where('status', 'ARRIVED')
            ->count();

        // 4. Chuẩn bị Data để đẩy vào View Blade
        $data = [
            'start_date' => $start->format('d/m/Y'),
            'end_date' => $end->format('d/m/Y'),
            'gross_revenue' => $grossRevenue,
            'refunded_amount' => $refundedAmount,
            'net_revenue' => $netRevenue,
            'total_bookings' => $totalBookings,
            'total_flights' => $totalFlights,
            'generated_at' => now()->format('d/m/Y H:i:s')
        ];

        // 5. Render file PDF từ View Blade
        $pdf = Pdf::loadView('reports.summary_pdf', $data);

        // Trả về object PDF để Controller quyết định download hay stream
        return $pdf; 
    }
}