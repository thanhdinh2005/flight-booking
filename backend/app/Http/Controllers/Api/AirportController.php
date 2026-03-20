<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SearchAirportRequest;
use App\Http\Response\ApiResponse;
use App\Http\Response\SearchAirportResponse;
use App\Models\Airport;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class AirportController extends Controller
{
    public function search(SearchAirportRequest $request)
    {
        try {
            $searchTerm = $request->validated()['q'] ?? null;
            //$searchTerm = $request->validated();
            // Truy vấn trực tiếp tại Controller cho gọn
            $query = Airport::select(['id', 'code', 'name', 'city']);

           if ($searchTerm) {
    $query->where(function ($q) use ($searchTerm) {
        $q->where('code', 'ILIKE', "%{$searchTerm}%")
          ->orWhere('name', 'ILIKE', "%{$searchTerm}%")
          ->orWhere('city', 'ILIKE', "%{$searchTerm}%");
    });
}


            $airports = $query->get();

            $message = $airports->isEmpty() 
                ? 'Không tìm thấy sân bay nào.' 
                : "Tìm thấy {$airports->count()} sân bay.";

             
            return  ApiResponse::success(
                new SearchAirportResponse($airports)->toArray(),
                $message,
                200
            );
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi kết nối cơ sở dữ liệu.',
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function getAirportById(int $airportId) {
        $data = Airport::find($airportId);

        return ApiResponse::success($data);
    }

    public function getAll() {
        return ApiResponse::success(Airport::all());
    }
}