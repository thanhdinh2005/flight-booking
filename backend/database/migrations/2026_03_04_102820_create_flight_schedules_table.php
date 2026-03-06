<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('flight_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_id')->constrained('routes')->onDelete('cascade');
            $table->string('flight_number', 10);
            $table->time('departure_time');
            $table->string('days_of_week', 20);
            $table->foreignId('aircraft_id')->constrained('aircrafts');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique([
                'route_id',
                'flight_number',
                'departure_time'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flight_schedules');
    }
};
