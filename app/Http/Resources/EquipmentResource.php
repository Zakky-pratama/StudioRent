<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EquipmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $hargaSewa = (int) $this->harga_sewa;
        $stok = (int) $this->stok;

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'nama_alat' => $this->nama_alat,
            'merk' => $this->merk,
            'spesifikasi' => $this->spesifikasi,
            'kondisi' => $this->kondisi,
            'harga_sewa' => $hargaSewa,
            'harga_sewa_formatted' => 'Rp '.number_format($hargaSewa, 0, ',', '.'),
            'satuan_sewa' => $this->satuan_sewa,
            'stok' => $stok,
            'tersedia' => $stok > 0,
            'status_ketersediaan' => $stok > 0 ? 'Tersedia' : 'Sedang Disewa',
            'gambar' => $this->gambar,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'nama_kategori' => $this->category->nama_kategori,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
