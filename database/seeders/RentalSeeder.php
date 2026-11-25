<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Equipment;
use App\Models\Rental;
use App\Models\User;
use Illuminate\Database\Seeder;

class RentalSeeder extends Seeder
{
    public function run(): void
    {
        $customers = Customer::pluck('id', 'nim_nik');
        $users = User::pluck('id', 'email');
        $equipments = Equipment::all()->keyBy('nama_alat');

        $transaksi = [
            [
                'nim_nik' => '2310501001',
                'petugas_email' => 'petugas1@studiorent.id',
                'mulai_hari_lalu' => 2,
                'durasi_hari' => 2,
                'status' => 'disewa',
                'items' => [
                    ['nama_alat' => 'Marshall JCM800 2203', 'jumlah' => 1],
                    ['nama_alat' => 'Shure SM58 & Mic Pack', 'jumlah' => 2],
                ],
            ],
            [
                'nim_nik' => '2310501002',
                'petugas_email' => 'petugas1@studiorent.id',
                'mulai_hari_lalu' => 1,
                'durasi_hari' => 2,
                'status' => 'disewa',
                'items' => [
                    ['nama_alat' => 'Yamaha Stage Custom Drum', 'jumlah' => 1],
                ],
            ],
            [
                'nim_nik' => '3578091204980001',
                'petugas_email' => 'petugas2@studiorent.id',
                'mulai_hari_lalu' => 5,
                'durasi_hari' => 3,
                'status' => 'terlambat',
                'items' => [
                    ['nama_alat' => 'Fender Stratocaster Player', 'jumlah' => 1],
                ],
            ],
            [
                'nim_nik' => '2310501004',
                'petugas_email' => 'petugas2@studiorent.id',
                'mulai_hari_lalu' => 0,
                'durasi_hari' => 0,
                'status' => 'disewa',
                'items' => [
                    ['nama_alat' => 'Studio Rekaman & Mixing B', 'jumlah' => 3],
                ],
            ],
            [
                'nim_nik' => '2310501005',
                'petugas_email' => 'petugas1@studiorent.id',
                'mulai_hari_lalu' => 0,
                'durasi_hari' => 2,
                'status' => 'disewa',
                'items' => [
                    ['nama_alat' => 'Behringer X32 Digital Mixer', 'jumlah' => 1],
                ],
            ],
            [
                'nim_nik' => '3578105409990003',
                'petugas_email' => 'petugas2@studiorent.id',
                'mulai_hari_lalu' => 6,
                'durasi_hari' => 3,
                'status' => 'dikembalikan',
                'items' => [
                    ['nama_alat' => 'Fender Precision Bass', 'jumlah' => 1],
                    ['nama_alat' => 'Roland RD-2000 Stage Piano', 'jumlah' => 1],
                ],
            ],
            [
                'nim_nik' => '2310501007',
                'petugas_email' => 'admin@studiorent.id',
                'mulai_hari_lalu' => 12,
                'durasi_hari' => 3,
                'status' => 'dikembalikan',
                'items' => [
                    ['nama_alat' => 'Gibson Les Paul Studio', 'jumlah' => 1],
                    ['nama_alat' => 'Shure SM58 & Mic Pack', 'jumlah' => 1],
                ],
            ],
            [
                'nim_nik' => '2310501008',
                'petugas_email' => 'petugas1@studiorent.id',
                'mulai_hari_lalu' => 8,
                'durasi_hari' => 4,
                'status' => 'terlambat',
                'items' => [
                    ['nama_alat' => 'Roland TD-17KVX E-Drum', 'jumlah' => 1],
                    ['nama_alat' => 'Neumann U87 Ai Condenser', 'jumlah' => 1],
                ],
            ],
        ];

        foreach ($transaksi as $data) {
            $tanggalSewa = now()->subDays($data['mulai_hari_lalu']);
            $tanggalRencana = $tanggalSewa->copy()->addDays($data['durasi_hari']);
            $pengaliDurasi = max(1, $data['durasi_hari']);

            $detailItems = [];
            $totalBiaya = 0;

            foreach ($data['items'] as $item) {
                $equipment = $equipments[$item['nama_alat']];
                $hargaSatuan = $equipment->harga_sewa;
                $subtotal = $hargaSatuan * $item['jumlah'] * $pengaliDurasi;
                $totalBiaya += $subtotal;

                $detailItems[] = [
                    'equipment_id' => $equipment->id,
                    'jumlah' => $item['jumlah'],
                    'harga_satuan' => $hargaSatuan,
                    'subtotal' => $subtotal,
                ];
            }

            $rental = Rental::updateOrCreate(
                [
                    'customer_id' => $customers[$data['nim_nik']],
                    'tanggal_sewa' => $tanggalSewa->toDateString(),
                ],
                [
                    'user_id' => $users[$data['petugas_email']],
                    'tanggal_kembali_rencana' => $tanggalRencana->toDateString(),
                    'tanggal_dikembalikan' => $data['status'] === 'dikembalikan'
                        ? $tanggalRencana->toDateString()
                        : null,
                    'total_biaya' => $totalBiaya,
                    'status' => $data['status'],
                ]
            );

            foreach ($detailItems as $detail) {
                $rental->rentalItems()->updateOrCreate(
                    ['equipment_id' => $detail['equipment_id']],
                    [
                        'jumlah' => $detail['jumlah'],
                        'harga_satuan' => $detail['harga_satuan'],
                        'subtotal' => $detail['subtotal'],
                    ]
                );
            }
        }
    }
}
