<?php

namespace App\Http\Response;

use Illuminate\Contracts\Support\Responsable;
use Illuminate\Http\JsonResponse;

class SearchFlightResponse
{
    private $outboundFlights;
    private $returnFlights;
    private $outboundDate;
    private $returnDate;

    public function __construct($outboundFlights, $returnFlights, $outboundDate, $returnDate)
    {
        $this->outboundFlights = $outboundFlights;
        $this->returnFlights = $returnFlights;
        $this->outboundDate = $outboundDate;
        $this->returnDate = $returnDate;
    }

    /**
     * Chuyển đổi dữ liệu thành định dạng JSON khi trả về
     */
    public function toArray(): array
    {
        if($this->outboundFlights->isEmpty() && $this->returnFlights->isEmpty()) {
            return [
                'message' => 'Không có chuyến bay',
                'outbound' => [],
                'return' => []
            ];
        }
        return [
            'outbound' => [
                [
                'date' => $this->outboundDate,
                'flights' => $this->mapFlights($this->outboundFlights)
                ]
            ],
            'return' => $this->returnDate ? [
                ['date' => $this->returnDate,
                'flights' => $this->mapFlights($this->returnFlights)
                ]
            ] : [] // tra ve mang rong neu khong co chuyen ve
        ];
    }
    private function mapFlights($flights) {
    return $flights->map(fn($f) => [
        'id' => $f->id,
        'flight_number' => $f->flightSchedule?->flight_number ?? 'N/A',
        // tra ve obj thay vi tra ve chuoi code
        'origin' => $f->route->origin->code,
        'destination' => $f->route->destination->code,
        'std' => \Carbon\Carbon::parse($f->std)->format('Y-m-d H:i:s'),
        'sta' => \Carbon\Carbon::parse($f->sta)->format('Y-m-d H:i:s'),
        'aircraft' => $f->aircraft?->registration_number ?? 'N/A',
    ]);
}
}