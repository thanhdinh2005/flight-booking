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
        Schema::create('users', function (Blueprint $table) {

            $table->bigIncrements('id');

            // Keycloak subject ID
            $table->uuid('keycloak_id')->unique();

            $table->string('email', 255)->unique();

            $table->string('full_name', 50);
            

            $table->string('phone_number', 20);

            $table->string('role', 50)->default('customer');
            $table->string('status', 20)->default('active');

            $table->timestamp('disabled_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
