<?php
namespace App\Application\UseCases;
use App\Models\FlightInstance;
use App\Http\Response\SearchFlightResponse;
use App\Models\Airport;
use Illuminate\Support\Collection;

class SearchFlightUseCase{
    public function execute(array $filters){
        //1 tim chuyen di
        
        $outbound = $this->queryFlights(
            $filters['origin'], 
            $filters['destination'], 
            $filters['departure_date']);
        //2 tim chuyen ve neu co
        $return = collect();
        if(!empty($filters['return_date'])){
            $return = $this->queryFlights(
                $filters['destination'], // Dao nguoc diem di/den
                $filters['origin'], 
                $filters['return_date']);
        }
        
        if($outbound->isEmpty() && $return->isEmpty()) {
            // Nếu không tìm thấy chuyến nào, trả về phản hồi đặc biệt
            return new SearchFlightResponse(
                collect(), // Dùng giá trị đặc biệt để FE nhận biết không có chuyến nào
                collect(),
                $filters['departure_date'], 
                $filters['return_date'] ?? null
            );
        }
        return new SearchFlightResponse(
            $outbound, 
            $return,
            $filters['departure_date'], 
            $filters['return_date'] ?? null
        );
    }
    private function queryFlights($origin, $destination, $date): Collection{
        // Thay vì gọi trực tiếp, hãy kiểm tra chắc chắn
        if (!$origin || !$destination) {
            // Trả về Collection rỗng thay vì JsonResponse
            return collect();
        }


        return \App\Models\FlightInstance ::with([
            'route.origin', 
            'route.destination',
            'aircraft' 
            ])
    ->whereHas('route', function ($query) use ($origin, $destination) {
        // Cấp 1: Kiểm tra quan hệ tới Route
        $query->whereHas('origin', function ($q) use ($origin) {
            // Cấp 2: Kiểm tra quan hệ từ Route tới Airport
            $q->where('code', $origin);
        })
        ->whereHas('destination', function ($q) use ($destination) {
            // Cấp 2: Kiểm tra quan hệ từ Route tới Airport cho điểm đến
            $q->where('code', $destination);
        });
    })
    ->whereDate('departure_date', $date)
    ->get();


    }
}