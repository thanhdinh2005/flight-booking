<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Http\Response\PaginationResponse;
use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function getAll(Request $request) {
        try {
        $user = $request->user();
        $userId = $user->id;
        $perPage = $request->input('per_page', 10);

        $paginator = Ticket::whereHas('booking', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->with([
            'booking', 
            'passenger', 
            'flight_instance.route.origin', 
            'flight_instance.route.destination'
        ])
        ->orderBy('created_at', 'desc')
        ->paginate($perPage);

        $pagination = PaginationResponse::fromPaginator($paginator, function (Ticket $ticket) {
            return [
                'ticket_id' => $ticket->id,
                'pnr' => $ticket->booking->pnr,
                'status' => $ticket->status,
                'seat_class' => $ticket->seat_class,
                'seat_number' => $ticket->seat_number,
                'ticket_price' => $ticket->ticket_price,
                'passenger_name' => $ticket->passenger->first_name . ' ' . $ticket->passenger->last_name,
                'flight' => [
                    'departure_time' => $ticket->flight_instance->std,
                    'origin' => $ticket->flight_instance->route->origin->code,
                    'destination' => $ticket->flight_instance->route->destination->code,
                ],
                'booked_at' => $ticket->created_at->format('Y-m-d H:i:s'),
            ];
        });

        return ApiResponse::success(
            $pagination->data, 
            "Lấy danh sách vé thành công",
            200,
            $pagination->meta
        );

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }
}
