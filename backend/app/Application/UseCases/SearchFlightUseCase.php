<?php
namespace App\Application\UseCases;
use App\Models\FlightInstance;

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
            $returnFlights = $this->queryFlights(
                $filters['destination'], // Dao nguoc diem di/den
                $filters['origin'], 
                $filters['return_date']);
        }
        return 
        [
            'outbound' => $outbound,
            'return' => $return
        ];
    }
    private function queryFlights($origin, $destination, $date){
        return \App\Models\FlightInstance ::with([
            'route.originAirport', 
            'route.destinationAirport',
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