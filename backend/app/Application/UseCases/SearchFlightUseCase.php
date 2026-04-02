<?php

namespace App\Application\UseCases;

use App\Enums\Flight\FlightStatus;
use App\Models\FlightInstance;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class SearchFlightUseCase
{
    public function execute(array $filters)
    {
        $passengers = $filters['passengers'] ?? 1;
        $origin = $filters['origin'];
        $destination = $filters['destination'];

        try {
            $outboundData = $this->getPrioritizedData(
                $origin,
                $destination,
                $filters['departure_date'],
                $passengers
            );

        // --- BẮT ĐẦU KIỂM TRA LỖI GHẾ ---
        if ($outbound->isEmpty()) {
            // Kiểm tra xem thực tế ngày đó có chuyến nào không (bất kể còn chỗ hay không)
            $hasAnyFlightAtAll = FlightInstance::whereHas('route', function ($query) use ($filters) {
                $query->whereHas('origin', fn($q) => $q->where('code', $filters['origin']))
                    ->whereHas('destination', fn($q) => $q->where('code', $filters['destination']));
            })
            ->whereDate('departure_date', $filters['departure_date'])
            ->exists();

            if ($hasAnyFlightAtAll) {
                // Có chuyến bay nhưng query trước đó không ra => Do bộ lọc seatInventories
                throw new \Exception("Rất tiếc, các chuyến bay từ {$filters['origin']} đến {$filters['destination']} đã hết chỗ cho {$passengers} hành khách.");
            } else {
                throw new \Exception("Hiện chưa có lịch bay cho chặng đường này vào ngày {$filters['departure_date']}.");
            }
        }
        // --- KẾT THÚC KIỂM TRA ---

        // 2. Tìm chuyến về nếu có
        $return = collect();
        if (!empty($filters['return_date'])) {
            $return = $this->queryFlights(
                $filters['destination'], 
                $filters['origin'], 
                $filters['return_date'],
                $passengers
            );

            // Kiểm tra tương tự cho chuyến về nếu cần thiết
            if ($return->isEmpty()) {
                throw new \Exception("Chuyến đi đã sẵn sàng, nhưng chuyến về hiện đã hết chỗ hoặc không có lịch bay.");
            }
        }

        return new SearchFlightResponse($outbound, $return, $filters['departure_date'], $filters['return_date'] ?? null);

    } catch (\Illuminate\Database\QueryException $e) {
        \Log::critical("Lỗi SQL: " . $e->getMessage());
        throw new \Exception("Lỗi hệ thống dữ liệu. Vui lòng thử lại sau.");
    } catch (\Exception $e) {
        // Log lại để debug nhưng ném ra để Frontend nhận được message
        \Log::error("Search Error: " . $e->getMessage());
        throw $e;
    }
}

    private function queryFlights($origin, $destination, $date, $passengers): Collection
    {
        if (empty($origin) || empty($destination) || empty($date)) {
            return collect();
        }

        return FlightInstance::with([
                'route.origin', 
                'route.destination',
                'aircraft',
                // Chỉ lấy những hạng ghế còn đủ chỗ
                'seatInventories' => function ($query) use ($passengers) {
                    $query->where('available_seats', '>=', $passengers);
                }
            ])
            ->whereHas('route', function ($query) use ($origin, $destination) {
                $query->whereHas('origin', fn($q) => $q->where('code', $origin))
                    ->whereHas('destination', fn($q) => $q->where('code', $destination));
            })
            ->whereDate('departure_date', $date)
            // Chỉ hiện những chuyến bay mà CÓ ÍT NHẤT 1 trong các hạng ghế còn đủ chỗ
            ->whereHas('seatInventories', function ($query) use ($passengers) {
                $query->where('available_seats', '>=', $passengers);
            })
            ->get();
    }
}
