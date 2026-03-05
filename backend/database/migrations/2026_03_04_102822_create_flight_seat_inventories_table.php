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
            $table->foreignId('flight_instance_id')->constrained('flight_instances');
            $table->string('seat_class', 20);
            $table->integer('total_seats');
            $table->integer('available_seats');
            $table->decimal('price', 15, 2);
            $table->string('currency', 3)->default('VND');
            $table->timestamps();
            $table->unique(['flight_instance_id', 'seat_class']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flight_seat_inventories');
    }
};
