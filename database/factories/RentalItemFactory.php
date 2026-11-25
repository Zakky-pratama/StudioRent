<?php

namespace Database\Factories;

use App\Models\Equipment;
use App\Models\Rental;
use App\Models\RentalItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RentalItem>
 */
class RentalItemFactory extends Factory
{
    public function definition(): array
    {
        $faker = fake('id_ID');
        $equipment = Equipment::query()->inRandomOrder()->first() ?? Equipment::factory()->create();
        $jumlah = $faker->numberBetween(1, 2);
        $hargaSatuan = $equipment->harga_sewa;

        return [
            'rental_id' => Rental::query()->inRandomOrder()->value('id') ?? Rental::factory(),
            'equipment_id' => $equipment->id,
            'jumlah' => $jumlah,
            'harga_satuan' => $hargaSatuan,
            'subtotal' => $jumlah * $hargaSatuan,
        ];
    }
}
