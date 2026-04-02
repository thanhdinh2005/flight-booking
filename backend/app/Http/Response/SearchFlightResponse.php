<?php

namespace App\Http\Response;

use Carbon\Carbon;
use Illuminate\Support\Collection;

class SearchFlightResponse
{
    private $outbound;
    private $return;

    public function __construct($outbound, $return = null)
    {
        $this->outbound = $outbound;
        $this->return = $return;
    }

    public function toArray(): array
    {
        return [
            // Dữ liệu lượt đi
            'outbound' => $this->formatSection($this->outbound),
            
            // Dữ liệu lượt về (nếu có)
            'return' => $this->return ? $this->formatSection($this->return) : null,
        ];
    }

    /**
     * Định dạng từng phần (Outbound/Return) theo cấu trúc mới
     */
    private function formatSection(array $section): array
    {
        // Nếu không có chuyến bay nào trong cả 5 ngày
        if ($section['status'] === 'EMPTY') {
            return [
                'status'  => $section['status'],
                'message' => $section['message'],
                'groups'  => []
            ];
        }

        return [
            'status'      => $section['status'],
            'message'     => $section['message'],
            'target_date' => $section['target_date'],
            // Dữ liệu đã được nhóm theo ngày
            'groups'      => $section['data'] 
        ];
    }
}