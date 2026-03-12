<?php

namespace App\Http\Controllers\api;

use App\Application\UseCases\CreateRefundTransactionUseCase;
use App\Application\UseCases\RejectRefundRequestUseCase;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProcessingRefundRequest;
use App\Http\Response\ApiResponse;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function approveRefundRequest(int $bookingRequestId ,ProcessingRefundRequest $request, CreateRefundTransactionUseCase $usecase) {
        $staffId = $request->user()->id;

        $usecase->execute($bookingRequestId, $staffId, $request->input('staff_note'));

        return ApiResponse::success();
    }

    public function rejectRefundRequest(Request $request ,int $bookingRequestId, RejectRefundRequestUseCase $useCase) {
        $staffId = $request->user()->id;
        $useCase->exectute(
            staffId: $staffId,
            bookingRequestId: $bookingRequestId,
            staffNote: $request->string('staff_note')
        );

        return ApiResponse::success();
    }
}
