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
    Schema::create('flight_seat_inventory', function (Blueprint $table) {
        $table->id();
        $table->foreignId('flight_instance_id')->constrained('flight_instances')->onDelete('cascade');
        $table->string('seat_class', 20);
        $table->unsignedInteger('total_seats'); // Không bao giờ âm
        $table->unsignedInteger('available_seats'); // Không bao giờ âm
        $table->decimal('price', 15, 2);
        $table->string('currency', 3)->default('VND');
        $table->timestamps();

        // Đảm bảo mỗi chặng chỉ có 1 dòng cho mỗi hạng ghế
        $table->unique(['flight_instance_id', 'seat_class'], 'idx_flight_seat_unique');
    });
}

public function down(): void
{
    // Sửa lại tên bảng cho khớp với hàm up
    Schema::dropIfExists('flight_seat_inventory');
}
};
