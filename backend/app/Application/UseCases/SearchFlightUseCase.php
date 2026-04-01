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

            $returnData = null;
            if (!empty($filters['return_date'])) {
                $returnData = $this->getPrioritizedData(
                    $destination,
                    $origin,
                    $filters['return_date'],
                    $passengers
                );
            }

            return [
                'outbound' => $outboundData,
                'return' => $returnData,
            ];
        } catch (\Exception $e) {
            Log::error('Search Error: ' . $e->getMessage());
            throw $e;
        }
    }

    private function getPrioritizedData($origin, $destination, $targetDate, $passengers)
{
    $targetDate = Carbon::parse($targetDate)->toDateString();
    $date = Carbon::parse($targetDate);
    $start = $date->copy()->subDays(2)->toDateString();
    $end = $date->copy()->addDays(2)->toDateString();
    $now = now('Asia/Ho_Chi_Minh');

    // 1. Query TẤT CẢ chuyến bay trong dải 5 ngày (Bỏ điều kiện lọc ghế và giờ ở đây)
    $allFlightsInRange = FlightInstance::with([
            'route.origin', 'route.destination', 'aircraft', 'flightSchedule', 'seatInventories'
        ])
        ->whereHas('route', function ($q) use ($origin, $destination) {
            $q->whereHas('origin', fn ($inner) => $inner->where('code', $origin))
                ->whereHas('destination', fn ($inner) => $inner->where('code', $destination));
        })
        ->whereBetween('departure_date', [$start, $end])
        ->whereNotIn('status', [FlightStatus::CANCELLED->value]) // Chỉ bỏ chuyến đã hủy
        ->get();

    if ($allFlightsInRange->isEmpty()) {
        return [
            'status' => 'EMPTY',
            'message' => "Hiện chưa có lịch bay cho chặng $origin - $destination trong khoảng thời gian này.",
            'data' => [],
        ];
    }

    // 2. Phân loại chuyến bay: Khả dụng vs Không khả dụng
    $validFlights = $allFlightsInRange->filter(function ($f) use ($now, $passengers) {
        $timeValid = Carbon::parse($f->etd ?? $f->std)->isAfter($now);
        $seatValid = $f->seatInventories->where('available_seats', '>=', $passengers)->isNotEmpty();
        $statusValid = !in_array($f->status, [FlightStatus::DEPARTED->value, FlightStatus::LANDED->value]);
        
        return $timeValid && $seatValid && $statusValid;
    });

    // 3. Gom nhóm các chuyến KHẢ DỤNG
    $grouped = $validFlights->groupBy(fn ($item) => Carbon::parse($item->departure_date)->toDateString());

    // 4. XỬ LÝ LOGIC THÔNG BÁO CHI TIẾT CHO NGÀY MỤC TIÊU (Target Date)
    if ($grouped->has($targetDate)) {
        return [
            'status' => 'FOUND_TARGET',
            'message' => 'Tìm thấy chuyến bay vào ngày bạn chọn.',
            'target_date' => $targetDate,
            'data' => $this->formatGroupedData($grouped, $targetDate),
        ];
    }
///
    // Nếu ngày mục tiêu có chuyến bay nhưng không đủ ghế cho số hành khách, hiển thị với thông báo
    $targetDayFlights = $allFlightsInRange->where('departure_date', $targetDate);
    if ($targetDayFlights->isNotEmpty()) {
        // Lọc các chuyến bay còn thời gian và trạng thái hợp lệ (nhưng có thể không đủ ghế)
        $availableTimeFlights = $targetDayFlights->filter(function ($f) use ($now) {
            $timeValid = Carbon::parse($f->etd ?? $f->std)->isAfter($now);
            $statusValid = !in_array($f->status, [FlightStatus::DEPARTED->value, FlightStatus::LANDED->value]);
            return $timeValid && $statusValid;
        });

        if ($availableTimeFlights->isNotEmpty()) {
            // Thêm vào grouped để hiển thị
            $groupedWithTarget = $grouped->put($targetDate, $availableTimeFlights);
            return [
                'status' => 'FOUND_BUT_INSUFFICIENT_SEATS',
                'message' => "Có chuyến bay vào ngày $targetDate nhưng không đủ ghế cho $passengers hành khách. Bạn có thể chọn ít hành khách hơn hoặc tham khảo các ngày lân cận.",
                'target_date' => $targetDate,
                'data' => $this->formatGroupedData($groupedWithTarget, $targetDate),
            ];
        }
    }

    // Nếu ngày mục tiêu không có chuyến khả dụng, tìm lý do cụ thể cho TỪNG chuyến bay
    $errorDetail = "";

    if ($targetDayFlights->isNotEmpty()) {
        $flightDetails = [];

        foreach ($targetDayFlights as $flight) {
            $reasons = [];

            // Kiểm tra thời gian
            $departureTime = Carbon::parse($flight->etd ?? $flight->std);
            if ($departureTime->isBefore($now)) {
                $reasons[] = "đã khởi hành";
            }

            // Kiểm tra ghế
            $maxAvailableSeats = $flight->seatInventories->max('available_seats') ?? 0;
            if ($maxAvailableSeats < $passengers) {
                $reasons[] = "hết chỗ (còn {$maxAvailableSeats} ghế)";
            }

            // Kiểm tra trạng thái
            if (in_array($flight->status, [FlightStatus::DEPARTED->value, FlightStatus::LANDED->value])) {
                $reasons[] = "đã cất cánh/đã hạ cánh";
            }

            if (!empty($reasons)) {
                $flightNumber = $flight->flightSchedule?->flight_number ?? 'N/A';
                $flightDetails[] = "Chuyến {$flightNumber} ({$departureTime->format('H:i')}): " . implode(', ', $reasons);
            }
        }

        if (!empty($flightDetails)) {
            $errorDetail = "Các chuyến bay trong ngày $targetDate không khả dụng:\n" . implode("\n", $flightDetails);
        } else {
            $errorDetail = "Ngày $targetDate hiện không còn chuyến bay khả dụng.";
        }
    } else {
        $errorDetail = "Hãng hiện không có lịch bay vào ngày $targetDate.";
    }

    return [
        'status' => 'SUGGESTED',
        'message' => $errorDetail . " Bạn có thể tham khảo các ngày lân cận sau:",
        'target_date' => $targetDate,
        'data' => $this->formatGroupedData($grouped),
    ];
}

    private function formatGroupedData(Collection $grouped, $priorityDate = null)
    {
        $result = [];

        if ($priorityDate && $grouped->has($priorityDate)) {
            $result[] = $this->mapDateGroup($priorityDate, $grouped->get($priorityDate), true);
        }

        foreach ($grouped as $date => $flights) {
            if ($date === $priorityDate) {
                continue;
            }

            $result[] = $this->mapDateGroup($date, $flights, false);
        }

        return $result;
    }

    private function mapDateGroup($date, $flights, $isTarget)
    {
        return [
            'date' => $date,
            'label' => Carbon::parse($date)->format('d/m'),
            'is_target' => $isTarget,
            'flights' => $flights->map(fn ($f) => [
                'id' => $f->id,
                'flight_number' => $f->flightSchedule?->flight_number ?? 'N/A',
                'std' => Carbon::parse($f->std)->format('H:i'),
                'sta' => Carbon::parse($f->sta)->format('H:i'),
                'aircraft' => $f->aircraft?->model ?? 'N/A',
                'seats' => $f->seatInventories->map(fn ($si) => [
                    'class' => $si->seat_class,
                    'price' => (float) $si->price,
                    'available' => $si->available_seats,
                ]),
            ]),
        ];
    }
}
