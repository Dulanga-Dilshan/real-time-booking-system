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
        Schema::create('bus_routes', function (Blueprint $table) {
            $table->id();
            $table->string('bus_number')->nullable();
            $table->string('from_location');
            $table->string('to_location');
            $table->time('departure_time');
            $table->time('arrival_time');
            $table->integer('total_seats')->default(40);
            $table->decimal('price', 8, 2);
            $table->boolean('is_active')->default(true);
            $table->foreignId('route_template_id')->nullable()->constrained('bus_route_templates')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bus_routes');
    }
};
