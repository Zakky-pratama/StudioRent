<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'nim_nik' => $this->nim_nik,
            'instansi' => $this->instansi,
            'email' => $this->email,
            'nomor_telepon' => $this->nomor_telepon,
            'alamat' => $this->alamat,
            'status' => $this->status,
            'rentals_count' => $this->whenCounted('rentals'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
