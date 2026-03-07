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
        Schema::create('flight_instances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flight_schedule_id')->nullable()->constrained('flight_schedules');
            $table->foreignId('route_id')->constrained('routes');
            $table->foreignId('aircraft_id')->constrained('aircrafts');
            $table->string('flight_number', 10);
            $table->date('departure_date');
            $table->timestamp('std'); // Giờ đi dự kiến (Scheduled Time of Departure)
            $table->timestamp('sta'); // Giờ đến dự kiến (Scheduled Time of Arrival)
            $table->timestamp('etd')->nullable(); // Giờ đi thực tế (Estimated Time of Departure)
            $table->timestamp('eta')->nullable(); // Giờ đến thực tế (Estimated Time of Arrival)
            $table->string('status', 20)->default('SCHEDULED');
            $table->timestamps();
            $table->unique([
                'flight_schedule_id',
                'departure_date'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flight_instances');
    }
};
