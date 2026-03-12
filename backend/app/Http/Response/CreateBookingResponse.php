<?php
namespace App\Http\Response;


use Illuminate\Http\JsonResponse;


class CreateBookingResponse {
    public function __construct(
        public string $id,
        public string $pnr,
        public string $status,
        public float $total_price,
        public array $itineraries,
        public array $tickets,
        public string $created_at,
    ) {}

    // Hàm này giúp biến Model thành đúng 7 tham số mà Constructor cần
    public static function fromModel($booking): self
    {
        return new self(
            id: (string) $booking->id,
            pnr: $booking->pnr,
            status: $booking->status,
            total_price: (float) $booking->total_amount,
            
            // Map thông tin chuyến bay cho FE
            itineraries: $booking->tickets->unique('flight_instance_id')->map(fn($t) => [
                'flight_number' => $t->flightInstance->flight_number,
                'origin' => $t->flightInstance->route->origin->city,
                'destination' => $t->flightInstance->route->destination->city,
                'departure_time' => $t->flightInstance->departure_time,
            ])->values()->toArray(),

            // Map thông tin vé
            tickets: $booking->tickets->map(fn($t) => [
                'ticket_id' => $t->id,
                'passenger' => $t->passenger->first_name . ' ' . $t->passenger->last_name,
                'class' => $t->seat_class
            ])->toArray(),
            
            created_at: $booking->created_at->toDateTimeString(),
        );
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'pnr' => $this->pnr,
            'status' => $this->status,
            'total_price' => $this->total_price,
            'itineraries' => $this->itineraries,
            'tickets' => $this->tickets,
            'created_at' => $this->created_at,
        ];
    }
}