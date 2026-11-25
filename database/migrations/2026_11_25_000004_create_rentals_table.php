<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('user_id')->constrained('users');
            $table->date('tanggal_sewa');
            $table->date('tanggal_kembali_rencana');
            $table->date('tanggal_dikembalikan')->nullable();
            $table->unsignedBigInteger('total_biaya');
            $table->enum('status', ['disewa', 'dikembalikan', 'terlambat'])->default('disewa');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
