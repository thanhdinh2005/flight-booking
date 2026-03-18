<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;

class AdminBookRequestController{
    public function show($id)
{
    // Load các quan hệ chung mà cả Refund và Exchange đều cần
    $request = BookingRequest::with(['user', 'ticket.flightInstance'])->findOrFail($id);

    // Xử lý dữ liệu đặc thù
    if ($request->request_type === 'REFUND') {
        // Bạn có thể gọi lại CalculateRefundAmountCommand ở đây 
        // để Admin thấy lại cách hệ thống tính ra con số đó
        $pricing = app(CalculateRefundAmountCommand::class)->execute($request->ticket);
        $request->setAttribute('meta', $pricing);
    } 
    elseif ($request->request_type === 'EXCHANGE') {
        // Load thông tin chuyến bay mới mà khách muốn đổi sang
        $request->setAttribute('meta', [
            'new_flight' => $request->newFlightInstance, // Giả sử bạn có quan hệ này
            'extra_charge' => 500000
        ]);
    }

    return ApiResponse::success($request);
}
}