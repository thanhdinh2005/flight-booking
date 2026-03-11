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
                'outbound' => ['lai'],
                'return' => ['lai']
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
        'flight_number' => $f->flight_number,
        // tra ve obj thay vi tra ve chuoi code
        'origin' => [
            'code' =>$f->route->origin->code,
            'name' => $f->route->origin->name,
            'city' => $f->route->origin->city,
        ],
        'destination' => [
            'code' =>$f->route->destination->code,
            'name' => $f->route->destination->name,
            'city' => $f->route->destination->city,
        ],
        'std' => $f->std,
        'sta' => $f->sta,
        'status' => $f->status,
        'aircraft' => [
                // 2. Dùng toán tử ?-> để không bị crash nếu aircraft bị null
                'model' => $f->aircraft?->model ?? 'N/A',
                'registration' => $f->aircraft?->registration_number ?? 'N/A',
            ]
    ]);
}
}