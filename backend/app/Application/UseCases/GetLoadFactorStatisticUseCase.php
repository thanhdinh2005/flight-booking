<?php

namespace App\Application\UseCases;

use App\Models\FlightSeatInventory;
use Carbon\Carbon;

class GetLoadFactorStatisticUseCase
{
    public function execute(?string $startDate, ?string $endDate): array
    {
        $start = $startDate ? Carbon::parse($startDate)->startOfDay() : Carbon::now()->startOfMonth();
        $end = $endDate ? Carbon::parse($endDate)->endOfDay() : Carbon::now()->endOfDay();

        // 1. TÍNH TỈ LỆ LẤP ĐẦY TỔNG THỂ (Overall Load Factor)
        $overallStats = FlightSeatInventory::join('flight_instances', 'flight_seat_inventory.flight_instance_id', '=', 'flight_instances.id')
            ->whereBetween('flight_instances.std', [$start, $end])
            ->where('flight_instances.status', '!=', 'CANCELLED') // Bỏ qua các chuyến bay đã bị hủy
            ->selectRaw('SUM(flight_seat_inventory.total_seats) as total_capacity')
            ->selectRaw('SUM(flight_seat_inventory.total_seats - flight_seat_inventory.available_seats) as total_sold')
            ->first();

        $totalCapacity = (int) $overallStats->total_capacity;
        $totalSold = (int) $overallStats->total_sold;
        
        $overallLoadFactor = $totalCapacity > 0 ? round(($totalSold / $totalCapacity) * 100, 2) : 0;

        // 2. TÍNH TỈ LỆ LẤP ĐẦY THEO TỪNG TUYẾN BAY (Load Factor by Route)
        $routeStats = FlightSeatInventory::join('flight_instances', 'flight_seat_inventory.flight_instance_id', '=', 'flight_instances.id')
            ->join('routes', 'flight_instances.route_id', '=', 'routes.id')
            // JOIN bảng airports lần 1 để lấy mã sân bay ĐI (Origin)
            ->join('airports as origin_airport', 'routes.origin_airport_id', '=', 'origin_airport.id')
            // JOIN bảng airports lần 2 để lấy mã sân bay ĐẾN (Destination)
            ->join('airports as dest_airport', 'routes.destination_airport_id', '=', 'dest_airport.id')
            
            ->whereBetween('flight_instances.std', [$start, $end])
            ->where('flight_instances.status', '!=', 'CANCELLED')
            
            // Group theo ID của route và mã của 2 sân bay
            ->groupBy('routes.id', 'origin_airport.code', 'dest_airport.code')
            
            // Nối mã sân bay lại thành tên tuyến (VD: "SGN - HAN")
            ->selectRaw("CONCAT(origin_airport.code, ' - ', dest_airport.code) as route_name")
            
            ->selectRaw('SUM(flight_seat_inventory.total_seats) as route_capacity')
            ->selectRaw('SUM(flight_seat_inventory.total_seats - flight_seat_inventory.available_seats) as route_sold')
            
            // Sắp xếp theo tỉ lệ lấp đầy giảm dần (Dùng NULLIF để an toàn tránh lỗi chia cho 0 trong SQL)
            ->orderByRaw('(SUM(flight_seat_inventory.total_seats - flight_seat_inventory.available_seats) * 1.0 / NULLIF(SUM(flight_seat_inventory.total_seats), 0)) DESC')
            ->limit(5)
            ->get();

        $routeLabels = [];
        $routeLoadFactors = [];

        foreach ($routeStats as $stat) {
            $routeLabels[] = $stat->route_name;
            $capacity = (int) $stat->route_capacity;
            $sold = (int) $stat->route_sold;
            $routeLoadFactors[] = $capacity > 0 ? round(($sold / $capacity) * 100, 2) : 0;
        }

        return [
            'overall' => [
                'load_factor_percentage' => $overallLoadFactor,
                'total_seats_supplied' => $totalCapacity,
                'total_seats_sold' => $totalSold
            ],
            'chart_by_route' => [
                'labels' => $routeLabels,
                'datasets' => [
                    [
                        'name' => 'Tỉ lệ lấp đầy (%)',
                        'data' => $routeLoadFactors // VD: [95.5, 82.0, ...]
                    ]
                ]
            ]
        ];
    }
}