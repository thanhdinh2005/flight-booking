<?php
namespace App\Application\Command\RefundTicket;

use App\Models\Ticket;
use Carbon\Carbon;
class CheckRefundEligibilityCommand
{
    const MIN_HOURS_BEFORE_FLIGHT = 24;

    public function execute(Ticket $ticket)
    {
        //1 kiem tra trang thai ve
        if($ticket->status !== 'PAID'){
            throw new \Exception('Chỉ vé đã thanh toán mới được phép hoàn.');
        }
        //2 Kiem tra thoi gian: so voi thoi gian khoi hanh
        $departureTime = Carbon::parse($ticket->flightInstance->std);
        if(now()->diffInHours($departureTime, false) < self::MIN_HOURS_BEFORE_FLIGHT){
            throw new \Exception('Vé chỉ được phép hoàn nếu còn hơn 24 giờ trước giờ khởi hành.');
        }
        return true;
    }
}