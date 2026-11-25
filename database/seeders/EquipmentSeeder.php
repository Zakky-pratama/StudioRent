<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Equipment;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::pluck('id', 'nama_kategori');

        $equipments = [
            [
                'category_id' => $categories['Gitar & Bass'],
                'nama_alat' => 'Fender Stratocaster Player',
                'merk' => 'Fender',
                'spesifikasi' => 'Single-coil SSS, Maple Neck, Sunburst',
                'kondisi' => 'Baik',
                'harga_sewa' => 150000,
                'satuan_sewa' => 'hari',
                'stok' => 3,
                'gambar' => '/images/equipments/fender-stratocaster.jpg',
            ],
            [
                'category_id' => $categories['Gitar & Bass'],
                'nama_alat' => 'Fender Precision Bass',
                'merk' => 'Fender',
                'spesifikasi' => '4-String Alder Body, Sage Green',
                'kondisi' => 'Baik',
                'harga_sewa' => 140000,
                'satuan_sewa' => 'hari',
                'stok' => 2,
                'gambar' => '/images/equipments/fender-precision-bass.jpg',
            ],
            [
                'category_id' => $categories['Gitar & Bass'],
                'nama_alat' => 'Gibson Les Paul Studio',
                'merk' => 'Gibson',
                'spesifikasi' => 'Dual Humbucker 490R/498T, Mahogany Body',
                'kondisi' => 'Sangat Baik',
                'harga_sewa' => 180000,
                'satuan_sewa' => 'hari',
                'stok' => 2,
                'gambar' => '/images/equipments/gibson-les-paul.jpg',
            ],
            [
                'category_id' => $categories['Drum & Perkusi'],
                'nama_alat' => 'Yamaha Stage Custom Drum',
                'merk' => 'Yamaha',
                'spesifikasi' => '5-Piece Birch Shell + Set Simbal Brass',
                'kondisi' => 'Sangat Baik',
                'harga_sewa' => 350000,
                'satuan_sewa' => 'hari',
                'stok' => 2,
                'gambar' => '/images/equipments/yamaha-stage-custom-drum.jpg',
            ],
            [
                'category_id' => $categories['Drum & Perkusi'],
                'nama_alat' => 'Roland TD-17KVX E-Drum',
                'merk' => 'Roland',
                'spesifikasi' => 'Mesh Head Drum Kit dengan Hi-Hat Stand',
                'kondisi' => 'Baik',
                'harga_sewa' => 300000,
                'satuan_sewa' => 'hari',
                'stok' => 1,
                'gambar' => '/images/equipments/roland-td17kvx-edrum.jpg',
            ],
            [
                'category_id' => $categories['Sound System'],
                'nama_alat' => 'Behringer X32 Digital Mixer',
                'merk' => 'Behringer',
                'spesifikasi' => '32-Channel Console, Motorized Fader',
                'kondisi' => 'Baik',
                'harga_sewa' => 450000,
                'satuan_sewa' => 'hari',
                'stok' => 0,
                'gambar' => '/images/equipments/behringer-x32-mixer.jpg',
            ],
            [
                'category_id' => $categories['Sound System'],
                'nama_alat' => 'Marshall JCM800 2203',
                'merk' => 'Marshall',
                'spesifikasi' => 'Tube Amp Head 100W + Kabinet 1960A 4x12',
                'kondisi' => 'Perlu Servis',
                'harga_sewa' => 250000,
                'satuan_sewa' => 'hari',
                'stok' => 1,
                'gambar' => '/images/equipments/marshall-jcm800-amp.jpg',
            ],
            [
                'category_id' => $categories['Sound System'],
                'nama_alat' => 'Shure SM58 & Mic Pack',
                'merk' => 'Shure',
                'spesifikasi' => 'Set 4 Mic Vokal + Stand Boom + Kabel XLR',
                'kondisi' => 'Baik',
                'harga_sewa' => 100000,
                'satuan_sewa' => 'hari',
                'stok' => 5,
                'gambar' => '/images/equipments/shure-sm58-mic.jpg',
            ],
            [
                'category_id' => $categories['Sound System'],
                'nama_alat' => 'Neumann U87 Ai Condenser',
                'merk' => 'Neumann',
                'spesifikasi' => 'Studio Condenser Microphone + Shockmount',
                'kondisi' => 'Sangat Baik',
                'harga_sewa' => 275000,
                'satuan_sewa' => 'hari',
                'stok' => 2,
                'gambar' => '/images/equipments/neumann-u87-condenser.jpg',
            ],
            [
                'category_id' => $categories['Ruang Studio'],
                'nama_alat' => 'Studio Latihan Full Band A',
                'merk' => 'StudioRent',
                'spesifikasi' => 'Kapasitas 6 Orang, AC & Peredam Akustik',
                'kondisi' => 'Sangat Baik',
                'harga_sewa' => 120000,
                'satuan_sewa' => 'jam',
                'stok' => 1,
                'gambar' => '/images/equipments/studio-latihan-band-a.jpg',
            ],
            [
                'category_id' => $categories['Ruang Studio'],
                'nama_alat' => 'Studio Rekaman & Mixing B',
                'merk' => 'StudioRent',
                'spesifikasi' => 'Ruang Kontrol + Booth Vokal Kedap Suara',
                'kondisi' => 'Sangat Baik',
                'harga_sewa' => 200000,
                'satuan_sewa' => 'jam',
                'stok' => 0,
                'gambar' => '/images/equipments/studio-rekaman-mixing-b.jpg',
            ],
            [
                'category_id' => $categories['Keyboard & Synth'],
                'nama_alat' => 'Roland RD-2000 Stage Piano',
                'merk' => 'Roland',
                'spesifikasi' => '88-Key Weighted Hammer Action + Sustain Pedal',
                'kondisi' => 'Baik',
                'harga_sewa' => 280000,
                'satuan_sewa' => 'hari',
                'stok' => 2,
                'gambar' => '/images/equipments/roland-rd2000-piano.jpg',
            ],
        ];

        foreach ($equipments as $equipment) {
            $payload = Equipment::factory()->make($equipment)->toArray();

            Equipment::updateOrCreate(
                ['nama_alat' => $equipment['nama_alat']],
                $payload
            );
        }
    }
}
