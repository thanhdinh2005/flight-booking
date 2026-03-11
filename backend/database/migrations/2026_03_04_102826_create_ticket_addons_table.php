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
        Schema::create('ticket_addons', function (Blueprint $table) {
    $table->id();
    $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
    $table->foreignId('addon_id')->constrained('addons')->onDelete('restrict');
    $table->decimal('amount', 15, 2);
    $table->integer('quantity')->default(1); // Xóa ->after('amount') đi nhé
    
    // Thay dòng created_at của bạn bằng dòng này:
    $table->timestamps(); 
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_addons');
    }
};
