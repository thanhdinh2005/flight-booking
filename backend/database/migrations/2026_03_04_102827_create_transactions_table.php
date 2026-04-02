<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            
            // Số tiền: Dùng decimal là chuẩn, nhưng tăng độ chính xác
            $table->decimal('amount', 15, 2);
            
            // Loại giao dịch: 'PAYMENT', 'REFUND', 'CHARGEBACK'
            $table->string('type', 20)->index(); 
            
            // Phương thức: 'VNPAY', 'MOMO', 'CASH'
            $table->string('payment_method', 50)->nullable();

            // Mã tham chiếu nội bộ gửi sang Gateway (vnp_TxnRef)
            // Cực kỳ quan trọng để VNPAY biết đang hoàn tiền cho hóa đơn nào
            $table->string('gateway_reference')->nullable()->unique()->index();

            // Mã giao dịch từ phía Gateway trả về (vnp_TransactionNo)
            $table->string('gateway_transaction_id')->nullable()->index();

            // Trạng thái: 'PENDING', 'SUCCESS', 'FAILED'
            $table->string('status', 20)->default('PENDING')->index();

            // Lưu log phản hồi từ Gateway (JSON) để debug khi có lỗi
            $table->json('gateway_response')->nullable();

            $table->timestamp('created_at')->useCurrent();
            // Thêm updated_at để biết thời điểm giao dịch thay đổi từ PENDING sang SUCCESS
            $table->timestamp('updated_at')->nullable(); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};