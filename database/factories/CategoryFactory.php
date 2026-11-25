<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $faker = fake('id_ID');

        $kategori = $faker->randomElement([
            'Gitar & Bass',
            'Drum & Perkusi',
            'Sound System',
            'Ruang Studio',
            'Keyboard & Synth',
            'Mikrofon & Rekaman',
        ]);

        return [
            'nama_kategori' => $kategori,
            'deskripsi' => 'Perlengkapan kategori '.$kategori.' siap pakai untuk latihan maupun produksi musik.',
        ];
    }
}
