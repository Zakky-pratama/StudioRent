<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Rental>
 */
class RentalFactory extends Factory
{
    public function definition(): array
    {
        $faker = fake('id_ID');
        $tanggalSewa = now()->subDays($faker->numberBetween(1, 14));
        $tanggalRencana = $tanggalSewa->copy()->addDays($faker->numberBetween(1, 4));
        $status = $faker->randomElement(['disewa', 'dikembalikan', 'terlambat']);

        return [
            'customer_id' => Customer::query()->inRandomOrder()->value('id') ?? Customer::factory(),
            'user_id' => User::query()->inRandomOrder()->value('id') ?? User::factory(),
            'tanggal_sewa' => $tanggalSewa->toDateString(),
            'tanggal_kembali_rencana' => $tanggalRencana->toDateString(),
            'tanggal_dikembalikan' => $status === 'dikembalikan'
                ? $tanggalRencana->toDateString()
                : null,
            'total_biaya' => $faker->numberBetween(15, 90) * 10000,
            'status' => $status,
        ];
    }
}
