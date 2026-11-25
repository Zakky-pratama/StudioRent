<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'nama_alat' => ['required', 'string', 'max:150'],
            'merk' => ['nullable', 'string', 'max:100'],
            'spesifikasi' => ['nullable', 'string', 'max:255'],
            'kondisi' => ['required', 'string', 'max:50'],
            'harga_sewa' => ['required', 'integer', 'min:0'],
            'satuan_sewa' => ['required', 'in:hari,jam'],
            'stok' => ['required', 'integer', 'min:0'],
            'gambar' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori alat wajib dipilih.',
            'category_id.integer' => 'Kategori alat tidak valid.',
            'category_id.exists' => 'Kategori yang dipilih tidak ditemukan.',
            'nama_alat.required' => 'Nama alat atau ruang studio wajib diisi.',
            'nama_alat.string' => 'Nama alat harus berupa teks.',
            'nama_alat.max' => 'Nama alat maksimal 150 karakter.',
            'merk.string' => 'Merk harus berupa teks.',
            'merk.max' => 'Merk maksimal 100 karakter.',
            'spesifikasi.string' => 'Spesifikasi harus berupa teks.',
            'spesifikasi.max' => 'Spesifikasi maksimal 255 karakter.',
            'kondisi.required' => 'Kondisi alat wajib diisi.',
            'kondisi.string' => 'Kondisi alat harus berupa teks.',
            'kondisi.max' => 'Kondisi alat maksimal 50 karakter.',
            'harga_sewa.required' => 'Harga sewa wajib diisi.',
            'harga_sewa.integer' => 'Harga sewa harus berupa angka bulat.',
            'harga_sewa.min' => 'Harga sewa tidak boleh bernilai negatif.',
            'satuan_sewa.required' => 'Satuan sewa wajib dipilih.',
            'satuan_sewa.in' => 'Satuan sewa harus berupa hari atau jam.',
            'stok.required' => 'Jumlah stok wajib diisi.',
            'stok.integer' => 'Stok harus berupa angka bulat.',
            'stok.min' => 'Stok tidak boleh kurang dari 0.',
            'gambar.string' => 'Path gambar harus berupa teks.',
            'gambar.max' => 'Path gambar maksimal 255 karakter.',
        ];
    }
}
