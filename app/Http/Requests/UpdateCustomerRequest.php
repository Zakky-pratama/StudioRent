<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $customerId = $this->route('id') ?? $this->route('customer');

        return [
            'nama' => ['required', 'string', 'max:100'],
            'nim_nik' => [
                'required',
                'string',
                'max:30',
                Rule::unique('customers', 'nim_nik')->ignore($customerId),
            ],
            'instansi' => ['nullable', 'string', 'max:100'],
            'email' => [
                'required',
                'email',
                'max:100',
                Rule::unique('customers', 'email')->ignore($customerId),
            ],
            'nomor_telepon' => ['required', 'string', 'max:20'],
            'alamat' => ['required', 'string'],
            'status' => ['required', 'in:aktif,nonaktif'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama penyewa wajib diisi.',
            'nama.string' => 'Nama penyewa harus berupa teks.',
            'nama.max' => 'Nama penyewa maksimal 100 karakter.',
            'nim_nik.required' => 'NIM atau NIK wajib diisi.',
            'nim_nik.string' => 'NIM atau NIK harus berupa teks.',
            'nim_nik.max' => 'NIM atau NIK maksimal 30 karakter.',
            'nim_nik.unique' => 'NIM atau NIK sudah terdaftar.',
            'instansi.string' => 'Nama instansi atau komunitas harus berupa teks.',
            'instansi.max' => 'Nama instansi maksimal 100 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email maksimal 100 karakter.',
            'email.unique' => 'Email penyewa sudah terdaftar.',
            'nomor_telepon.required' => 'Nomor telepon wajib diisi.',
            'nomor_telepon.string' => 'Nomor telepon harus berupa teks.',
            'nomor_telepon.max' => 'Nomor telepon maksimal 20 karakter.',
            'alamat.required' => 'Alamat wajib diisi.',
            'alamat.string' => 'Alamat harus berupa teks.',
            'status.required' => 'Status penyewa wajib dipilih.',
            'status.in' => 'Status penyewa harus berupa aktif atau nonaktif.',
        ];
    }
}
