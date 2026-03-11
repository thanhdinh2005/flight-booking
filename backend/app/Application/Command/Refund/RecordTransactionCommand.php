<?php

namespace App\Application\Command\Refund;

use App\Models\Transaction;

class RecordTransactionCommand
{
    public function execute($bookingId, $amount, $paymentMethod, $gatewayTxnId)
    {
        return Transaction::create([
            'booking_id' => $bookingId,
            'amount' => $amount,
            'type' => 'REFUND',
            'payment_method' => $paymentMethod,
            'gateway_transaction_id' => $gatewayTxnId,
            'status' => 'SUCCESS',
        ]);
    }
}