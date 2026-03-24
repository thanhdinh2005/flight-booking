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
        //1 kiem tra trang thai ve
        if($ticket->status !== TicketStatus::ACTIVE){
            throw new \Exception('Chỉ vé đã thanh toán mới được phép hoàn.');
        }
        //2 Kiem tra thoi gian: so voi thoi gian khoi hanh
        $departureTime = Carbon::parse($ticket->flight_instance->std);
        /*if(now()->diffInHours($departureTime, false) < self::MIN_HOURS_BEFORE_FLIGHT){
            throw new \Exception('Vé chỉ được phép hoàn nếu còn hơn 24 giờ trước giờ khởi hành.');
        }*/
        return true;
    }
}