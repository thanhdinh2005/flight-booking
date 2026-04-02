<?php

namespace App\Application\UseCases;

use App\Application\Command\AuditLog\CreateAuditLogCommand;
use App\Application\Command\Refund\CallVnpayRefundCommand;
use App\Application\Command\Refund\RecordTransactionCommand;
use App\Application\Command\Refund\RestoreFlightSeatsCommand;
use App\Application\Command\Refund\UpdateRefundStateCommand;
use App\Exceptions\BusinessException;
use App\Jobs\SendRefundConfirmationEmail;
use App\Models\Booking;
use App\Models\BookingRequest;
use App\Models\FlightInstance;
use App\Models\Ticket;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Throwable;

class CreateRefundTransactionUseCase
{
    public function __construct(
        protected CallVnpayRefundCommand $vnpayCmd,
        protected RestoreFlightSeatsCommand $restoreSeatsCmd,
        protected UpdateRefundStateCommand $updateStateCmd,
        protected RecordTransactionCommand $recordTxCmd,
        protected CreateAuditLogCommand $auditCmd
    ) {}

    public function execute(
        int $requestId, int $staffId, ?string $staffNote
    ) {
        $request = BookingRequest::where('id', $requestId)
            ->where('request_type', 'REFUND')
            ->where('status', 'PENDING')->first();
        
        if (!$request) throw new BusinessException("Yêu cầu không hợp lệ hoặc đã duyệt.");

        $booking = Booking::findOrFail($request->booking_id);
        $tickets = Ticket::where('booking_id', $booking->id)->get();

        $paymentTransaction = Transaction::where('booking_id', $booking->id)
            ->where('type', 'PAYMENT')
            ->where('status', 'SUCCESS')
            ->first();

        if (!$paymentTransaction) throw new BusinessException("Không tìm thấy giao dịch thanh toán gốc.");

        $firstTicket = $tickets->first();
        $flightInstance = FlightInstance::findOrFail($firstTicket->flight_instance_id);
        if (Carbon::now()->isAfter(Carbon::parse($flightInstance->std))) {
            throw new BusinessException("Chuyến bay đã cất cánh, không thể hoàn vé.");
        }

        $refundAmount = $booking->total_amount * 0.7;

        DB::beginTransaction();

        try {
            $this->vnpayCmd->execute($paymentTransaction, $refundAmount, $staffId);

            $this->updateStateCmd->execute($request, $booking, $tickets, $staffNote);

            $this->restoreSeatsCmd->execute($tickets);

            $this->recordTxCmd->execute(
                $booking->id,
                $refundAmount,
                $paymentTransaction->payment_method,
                $paymentTransaction->gateway_transaction_id
            );

            $this->auditCmd->execute(
                userId: $staffId,
                action: 'APPROVE_REFUND_REQUEST',
                targetTable: 'booking_requests',
                targetId: $requestId,
                changes: null,
                ipAddress: null
            );

            DB::commit();

            SendRefundConfirmationEmail::dispatch($booking, $refundAmount)->afterCommit();

        } catch (Throwable $e) {
            DB::rollBack();
            throw $e;
        }

    }

}
