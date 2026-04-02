<?php
namespace App\Application\Command\RefundTicket;

use App\Models\Ticket;
use Carbon\Carbon;
use App\Enums\Booking\TicketStatus;

class CheckRefundEligibilityCommand
{
    const MIN_HOURS_BEFORE_FLIGHT = 24;

    public function execute(Ticket $ticket)
{
    // 1. Kiểm tra trạng thái
    if($ticket->status !== TicketStatus::ACTIVE){
        throw new \Exception('Chỉ vé ở trạng thái ACTIVE mới được phép gửi yêu cầu hoàn.');
    }

    // 2. Kiểm tra Check-in (Rất quan trọng)
    // Nếu status là CHECKED_IN thì không được hoàn trực tiếp
    if ($ticket->status === TicketStatus::CHECKED_IN) {
        throw new \Exception('Hành khách đã làm thủ tục chuyến bay. Vui lòng hủy check-in trước khi hoàn vé.');
    }

    // 3. Kiểm tra tính chất vé (Ví dụ: vé khuyến mãi không cho hoàn)
    if (isset($ticket->is_refundable) && !$ticket->is_refundable) {
        throw new \Exception('Loại vé này không nằm trong danh sách được phép hoàn tiền theo quy định.');
    }

    // 4. Kiểm tra thời gian khởi hành
    // Đảm bảo flight_instance đã được load
    $departureTime = Carbon::parse($ticket->flight_instance->std);
    if (now()->diffInHours($departureTime, false) < self::MIN_HOURS_BEFORE_FLIGHT) {
         throw new \Exception("Yêu cầu hoàn vé phải được thực hiện ít nhất " . self::MIN_HOURS_BEFORE_FLIGHT . " giờ trước giờ bay.");
    }

    return true;
}
}