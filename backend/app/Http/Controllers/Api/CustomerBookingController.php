<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\RequestBookingRefundUseCase;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreatereRefundRequest;
use App\Http\Response\ApiResponse;
use Exception;

class CustomerBookingController extends Controller
{
    public function requestRefund(int $bookingId, CreatereRefundRequest $request, RequestBookingRefundUseCase $refundUseCase) {
        try {
            $user = $request->user();

            $bookingRequest = $refundUseCase->execute(
                booking_id: $bookingId,
                user_id: $user->id,
                reason: $request->string('reason')
            );

            return ApiResponse::success(
                data: $bookingRequest,
                message: "Thành công",
                status: 201
            );

        } catch (Exception $e) {
            return ApiResponse::error($e->getMessage());
        }
    }
}
