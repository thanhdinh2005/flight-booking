<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $table = "transactions";
    
    // Bật timestamps vì chúng ta cần created_at và updated_at để đối soát thời gian thanh toán
    public $timestamps = true; 

    protected $fillable = [
        'booking_id', 
        'amount', 
        'type',             // 'PAYMENT', 'REFUND'
        'payment_method',   // 'VNPAY', 'MOMO', ...
        'gateway_transaction_id', // vnp_TransactionNo (BẮT BUỘC để Refund)
        'gateway_reference',      // vnp_TxnRef (BẮT BUỘC để Refund)
        'gateway_response',       // Lưu toàn bộ JSON từ VNPAY
        'status'                  // 'PENDING', 'SUCCESS', 'FAILED'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        // Tự động convert JSON từ DB sang Array khi sử dụng trong PHP
        'gateway_response' => 'array', 
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Liên kết với đơn hàng
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    /**
     * Helper để lấy ngày thanh toán chuẩn từ VNPAY (vnp_PayDate)
     * Phục vụ tham số vnp_TransactionDate khi gọi Refund
     */
    public function getVnpayPayDate(): ?string
    {
        return $this->gateway_response['vnp_PayDate'] ?? null;
    }
}
