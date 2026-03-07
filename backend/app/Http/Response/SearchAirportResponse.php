<?php

namespace App\Http\Response;

class SearchAirportResponse
{
    private $airports;

    public function __construct($airports)
    {
        $this->airports = $airports;
    }

    /**
     * Chuyển đổi dữ liệu sân bay sang mảng chuẩn cho API
     */
    public function toArray(): array
    {
        return $this->airports->map(fn($airport) => [
            'id'           => $airport->id,
            'code'         => $airport->code,
            'name'         => $airport->name,
            'city'         => $airport->city,
            'display_name' => "({$airport->code}) {$airport->name}",
        ])->toArray();
    }
}