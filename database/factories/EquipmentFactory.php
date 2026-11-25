<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Equipment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Equipment>
 */
class EquipmentFactory extends Factory
{
    public function definition(): array
    {
        $faker = fake('id_ID');

        $daftarAlat = [
            ['nama' => 'Fender Stratocaster Player', 'merk' => 'Fender', 'spek' => 'Single-coil SSS, Maple Neck', 'satuan' => 'hari', 'harga' => 150000],
            ['nama' => 'Yamaha Stage Custom Drum', 'merk' => 'Yamaha', 'spek' => '5-Piece Birch Shell + Set Simbal', 'satuan' => 'hari', 'harga' => 350000],
            ['nama' => 'Behringer X32 Digital Mixer', 'merk' => 'Behringer', 'spek' => '32-Channel Motorized Fader', 'satuan' => 'hari', 'harga' => 450000],
            ['nama' => 'Studio Latihan Full Band A', 'merk' => 'StudioRent', 'spek' => 'Kapasitas 6 Orang, AC & Peredam Akustik', 'satuan' => 'jam', 'harga' => 120000],
            ['nama' => 'Roland RD-2000 Stage Piano', 'merk' => 'Roland', 'spek' => '88-Key Weighted Hammer Action', 'satuan' => 'hari', 'harga' => 280000],
        ];

        $pilihan = $faker->randomElement($daftarAlat);

        return [
            'category_id' => Category::query()->inRandomOrder()->value('id') ?? Category::factory(),
            'nama_alat' => $pilihan['nama'],
            'merk' => $pilihan['merk'],
            'spesifikasi' => $pilihan['spek'],
            'kondisi' => $faker->randomElement(['Sangat Baik', 'Baik', 'Baik']),
            'harga_sewa' => $pilihan['harga'],
            'satuan_sewa' => $pilihan['satuan'],
            'stok' => $faker->numberBetween(1, 5),
            'gambar' => null,
        ];
    }
}
