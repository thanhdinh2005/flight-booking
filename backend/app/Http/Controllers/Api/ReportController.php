<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\ExportSummaryReportUseCase;
use App\Enums\Booking\TicketStatus;
use App\Enums\Flight\FlightStatus;
use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Models\Route;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function exportPdf(Request $request, ExportSummaryReportUseCase $useCase)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $pdf = $useCase->execute($request->start_date, $request->end_date);

        $fileName = 'Bao_Cao_Doanh_Thu_' . time() . '.pdf';

        return $pdf->download($fileName);
    }

    public function getRouteChartData(Request $request)
    {
        try {
            // 1. Xác định thời gian (Mặc định từ đầu tháng đến hiện tại)
            $start = $request->input('start_date') 
                ? Carbon::parse($request->input('start_date'))->startOfDay() 
                : Carbon::now()->startOfMonth();
                
            $end = $request->input('end_date') 
                ? Carbon::parse($request->input('end_date'))->endOfDay() 
                : Carbon::now()->endOfDay();

            // 2. Query lấy TẤT CẢ routes và đếm vé (Dùng LEFT JOIN)
            $routeStats = Route::join('airports as origin', 'routes.origin_airport_id', '=', 'origin.id')
                ->join('airports as dest', 'routes.destination_airport_id', '=', 'dest.id')
                
                // LEFT JOIN với flight_instances kèm điều kiện thời gian
                ->leftJoin('flight_instances', function($join) use ($start, $end) {
                    $join->on('routes.id', '=', 'flight_instances.route_id')
                         ->whereBetween('flight_instances.std', [$start, $end])
                         ->where('flight_instances.status', '!=', FlightStatus::CANCELLED);
                })
                
                // LEFT JOIN tiếp với tickets để đếm số vé hợp lệ
                ->leftJoin('tickets', function($join) {
                    $join->on('flight_instances.id', '=', 'tickets.flight_instance_id')
                         ->where('tickets.status', TicketStatus::ACTIVE);
                })
                
                // Group by theo ID của tuyến bay
                ->groupBy('routes.id', 'origin.code', 'dest.code')
                
                // Select Tên tuyến và Đếm số vé
                ->selectRaw("CONCAT(origin.code, ' ➝ ', dest.code) as route_name")
                ->selectRaw("COUNT(tickets.id) as total_tickets")
                
                // Sắp xếp theo ID tuyến hoặc theo số vé (Tùy bạn, ở đây xếp theo tên cho dễ nhìn)
                ->orderBy('route_name')
                ->get();

            // 3. Tách mảng Labels (Trục X) và Data (Trục Y) cho Frontend
            $labels = [];
            $dataValues = [];

            foreach ($routeStats as $stat) {
                $labels[] = $stat->route_name; 
                $dataValues[] = (int) $stat->total_tickets;
            }

            // 4. Trả về cấu trúc JSON chuẩn cho Chart
            return ApiResponse::success([
                'chart_type' => 'bar',
                'chart_title' => 'So sánh doanh số vé giữa các tuyến bay',
                'labels' => $labels,
                'datasets' => [
                    [
                        'name' => 'Số vé đã bán',
                        'data' => $dataValues,
                        // Bạn có thể gợi ý màu sắc cho FE luôn nếu thích
                        'backgroundColor' => '#3b82f6' 
                    ]
                ]
            ], "Lấy dữ liệu biểu đồ so sánh tuyến bay thành công");

        } catch (\Exception $e) {
            return ApiResponse::error('Lỗi khi thống kê biểu đồ so sánh: ' . $e->getMessage(), 500);
        }
    }
}