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
        Schema::create('addons', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên hiển thị: Hành lý 20kg, Suất ăn chay...
            $table->string('code')->unique(); // Mã định danh: BAGGAGE_20, MEAL_VEG...
            $table->string('type'); // Phân loại: LUGGAGE, MEAL, SEAT_SELECTION...
            $table->decimal('price', 15, 2); // Giá tiền niêm yết
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addons');
    }
};
