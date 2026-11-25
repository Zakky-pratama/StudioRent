<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RentalResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $totalBiaya = (int) $this->total_biaya;

        return [
            'id' => $this->id,
            'kode_sewa' => '#RNT-'.str_pad((string) $this->id, 3, '0', STR_PAD_LEFT),
            'customer_id' => $this->customer_id,
            'user_id' => $this->user_id,
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'nama' => $this->customer->nama,
                'nim_nik' => $this->customer->nim_nik,
                'instansi' => $this->customer->instansi,
                'nomor_telepon' => $this->customer->nomor_telepon,
            ]),
            'petugas' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'role' => $this->user->role,
            ]),
            'tanggal_sewa' => $this->tanggal_sewa,
            'tanggal_kembali_rencana' => $this->tanggal_kembali_rencana,
            'tanggal_dikembalikan' => $this->tanggal_dikembalikan,
            'total_biaya' => $totalBiaya,
            'total_biaya_formatted' => 'Rp '.number_format($totalBiaya, 0, ',', '.'),
            'status' => $this->status,
            'items' => $this->whenLoaded('rentalItems', fn () => $this->rentalItems->map(fn ($item) => [
                'id' => $item->id,
                'equipment_id' => $item->equipment_id,
                'nama_alat' => $item->equipment?->nama_alat,
                'merk' => $item->equipment?->merk,
                'satuan_sewa' => $item->equipment?->satuan_sewa,
                'jumlah' => (int) $item->jumlah,
                'harga_satuan' => (int) $item->harga_satuan,
                'subtotal' => (int) $item->subtotal,
            ])->values()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
