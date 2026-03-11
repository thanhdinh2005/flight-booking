<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('passengers', function (Blueprint $table) {
        $table->id();
        // Liên kết với bảng bookings. onDelete('cascade') để khi xóa booking thì khách cũng biến mất.
        $table->string('first_name');
        $table->string('last_name');
        $table->string('gender', 10)->nullable();
        $table->date('date_of_birth')->nullable();
        $table->string('id_number')->nullable(); // CCCD hoặc Hộ chiếu
        $table->string('type')->default('adult'); // adult, child, infant
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('passengers');
    }
};
