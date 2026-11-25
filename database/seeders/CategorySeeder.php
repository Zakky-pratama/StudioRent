<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'nama_kategori' => 'Gitar & Bass',
                'deskripsi' => 'Koleksi gitar elektrik, akustik, dan bass untuk panggung maupun rekaman studio.',
            ],
            [
                'nama_kategori' => 'Drum & Perkusi',
                'deskripsi' => 'Set drum akustik, drum elektrik, simbal, dan perkusi panggung.',
            ],
            [
                'nama_kategori' => 'Sound System',
                'deskripsi' => 'Mixer digital, amplifier tabung, speaker aktif, dan paket mikrofon studio.',
            ],
            [
                'nama_kategori' => 'Ruang Studio',
                'deskripsi' => 'Ruang latihan band berperedam akustik dan ruang rekaman profesional.',
            ],
            [
                'nama_kategori' => 'Keyboard & Synth',
                'deskripsi' => 'Stage piano, synthesizer, dan MIDI controller untuk kebutuhan live maupun produksi.',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['nama_kategori' => $category['nama_kategori']],
                $category
            );
        }
    }
}
