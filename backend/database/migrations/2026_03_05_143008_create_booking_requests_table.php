<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('booking_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');

            // 1. Thêm ticket_id để biết chính xác vé nào cần refund
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');

            // 2. Thêm refund_amount để Staff thấy số tiền cần hoàn ngay lập tức
            $table->decimal('refund_amount', 15, 2); 
            $table->decimal('system_refund_amount', 15, 2)->nullable();
            $table->string('request_type', 50); // REFUND, CHANGE_FLIGHT
            $table->text('reason')->nullable();
            $table->text('staff_note')->nullable();
            $table->foreignId('staff_id')->nullable()->constrained('users'); // Ai là người xử lý đơn này
            $table->timestamp('processed_at')->nullable(); // Thời điểm Admin bấm nút Duyệt/Từ chối
            $table->string('status', 20)->default('PENDING');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_requests');
    }
};
