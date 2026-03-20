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
    Schema::create('aircraft_seats', function (Blueprint $table) {
        $table->id();
        $table->foreignId('aircraft_id')->constrained('aircrafts')->onDelete('cascade');
        $table->string('seat_number', 10); // Ví dụ: 1A, 12F
        $table->string('seat_class');      // BUSINESS, ECONOMY
        $table->boolean('is_active')->default(true); // Ghế hỏng thì set false
        
        // Quan trọng: Một máy bay không thể có 2 ghế trùng tên
        $table->unique(['aircraft_id', 'seat_number']);
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aircraft_seats');
    }
};
