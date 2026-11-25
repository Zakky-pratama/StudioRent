<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'nama' => 'Ahmad Fauzi',
                'nim_nik' => '2310501001',
                'instansi' => 'UKM Musik PENS',
                'email' => 'ahmad.fauzi@pens.ac.id',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Rian Pratama',
                'nim_nik' => '2310501002',
                'instansi' => 'Indie Band Surabaya',
                'email' => 'rian.pratama@pens.ac.id',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Budi Santoso',
                'nim_nik' => '3578091204980001',
                'instansi' => 'Akustik Soloist',
                'email' => 'budi.santoso@musikmail.id',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Dewi Lestari',
                'nim_nik' => '2310501004',
                'instansi' => 'SMAN 5 Studio Project',
                'email' => 'dewi.lestari@pens.ac.id',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Kevin Sanjaya',
                'nim_nik' => '2310501005',
                'instansi' => 'Audio Engineering PENS',
                'email' => 'kevin.sanjaya@pens.ac.id',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Siti Rahma',
                'nim_nik' => '3578105409990003',
                'instansi' => 'Komunitas Jazz Surabaya',
                'email' => 'siti.rahma@musikmail.id',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Bagus Wijaya',
                'nim_nik' => '2310501007',
                'instansi' => 'Himpunan Mahasiswa Informatika',
                'email' => 'bagus.wijaya@pens.ac.id',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Nadia Kusuma',
                'nim_nik' => '2310501008',
                'instansi' => 'Paduan Suara Kampus',
                'email' => 'nadia.kusuma@pens.ac.id',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Fajar Nugroho',
                'nim_nik' => '3515082107970002',
                'instansi' => 'Siniar Kreatif Surabaya',
                'email' => 'fajar.nugroho@musikmail.id',
                'status' => 'aktif',
            ],
            [
                'nama' => 'Putri Maharani',
                'nim_nik' => '2310501010',
                'instansi' => 'Teater Musik Kampus',
                'email' => 'putri.maharani@pens.ac.id',
                'status' => 'nonaktif',
            ],
        ];

        foreach ($customers as $customer) {
            $payload = Customer::factory()->make($customer)->toArray();

            Customer::updateOrCreate(
                ['nim_nik' => $customer['nim_nik']],
                $payload
            );
        }
    }
}
