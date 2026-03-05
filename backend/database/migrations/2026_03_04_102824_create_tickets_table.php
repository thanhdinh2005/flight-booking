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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings');
            $table->foreignId('flight_instance_id')->constrained('flight_instances');
            $table->string('passenger_name');
            $table->date('passenger_dob')->nullable();
            $table->string('passenger_ic', 50)->nullable();
            $table->string('seat_class', 20);
            $table->string('seat_number', 10)->nullable();
            $table->decimal('ticket_price', 15, 2);
            $table->string('status', 20)->default('ACTIVE');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
