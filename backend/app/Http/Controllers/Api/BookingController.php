<?php

namespace app\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateBookingRequest;
use App\Application\UseCases\CreateBookingUseCase;
use App\Application\Command\Pricing\SyncAddonQuantityCommand;
use App\Http\Response\CreateBookingResponse;
use Illuminate\Http\Request;
use App\Http\Requests\AddonBookingRequest;
use App\Http\Response\ApiResponse;

class BookingController extends Controller
{
    protected $createBookingUseCase;
    protected $updateAddonCommand;

    public function __construct(
        CreateBookingUseCase $createBookingUseCase,
        SyncAddonQuantityCommand $updateAddonCommand
    ) {
        $this->createBookingUseCase = $createBookingUseCase;
        $this->updateAddonCommand = $updateAddonCommand;
    }

    /**
     * Giai đoạn 1: Tạo đặt chỗ (Booking & Tickets)
     */
    public function store(CreateBookingRequest $request)
{
    // 1. Lấy dữ liệu đã qua kiểm duyệt
    $data = $request->validated();
    $userId = $request->user()->id;
    
    try {
        
        // 2. Thực thi nghiệp vụ tạo Booking
        // Lúc này UseCase của bạn đang trả về trực tiếp Model Booking (hoặc mixed)
        $booking = $this->createBookingUseCase->execute($data, $userId);

        // 3. Vì bạn muốn kiểm tra logic đã chạy đúng chưa, 
        // ta sẽ load thêm các quan hệ để xem chi tiết trong Postman
        // Lưu ý: Nếu UseCase đã load rồi thì không cần dòng này, nhưng viết thêm cũng không sao.
        $booking->load([
            'tickets.passenger',
            'tickets.flight_instance.route.origin',
            'tickets.flight_instance.route.destination'
        ]);

        // 4. Trả về dữ liệu thô (Array) thông qua ApiResponse để kiểm tra
        return ApiResponse::success(
            $booking->toArray(),
            'Giữ chỗ thành công. Logic đã chạy mượt!',
            201
        );

    } catch (\Exception $e) {
        // Trả về lỗi nếu có vấn đề trong quá trình DB Transaction (hết ghế, lỗi logic...)
        return ApiResponse::error(
            $e->getMessage(),
            400
        );
    }
}

    /**
     * Giai đoạn 2: Thêm dịch vụ bổ sung (Addon) cho từng vé
     */
    public function addAddon(AddonBookingRequest $request)
    {
        // Validate nhanh tại chỗ hoặc tạo Request riêng
        $result = $this->updateAddonCommand->execute(
        $request->ticket_id, 
        $request->addon_id,
        $request->quantity
    );

    return ApiResponse::success(
        $result,
        'Cập nhật dịch vụ bổ sung thành công.',
        200
    );
    }
}