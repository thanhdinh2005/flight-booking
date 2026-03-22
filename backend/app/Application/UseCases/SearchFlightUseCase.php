<?php

namespace App\Application\UseCases;

use App\Models\FlightInstance;
use App\Http\Response\SearchFlightResponse;
use Illuminate\Support\Collection;

class SearchFlightUseCase
{
    public function execute(array $filters)
    {
        $passengers = $filters['passengers'] ?? 1;

        // 1. Tìm chuyến đi
        $outbound = $this->queryFlights(
            $filters['origin'], 
            $filters['destination'], 
            $filters['departure_date'],
            $passengers
        );

        // 2. Tìm chuyến về nếu có
        $return = collect();
        if (!empty($filters['return_date'])) {
            $return = $this->queryFlights(
                $filters['destination'], 
                $filters['origin'], 
                $filters['return_date'],
                $passengers
            );
        }

        return new SearchFlightResponse($outbound, $return, $filters['departure_date'], $filters['return_date'] ?? null);
    }

    private function queryFlights($origin, $destination, $date, $passengers): Collection
    {
        if (!$origin || !$destination) {
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