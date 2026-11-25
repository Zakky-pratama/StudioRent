<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRentalRequest extends FormRequest
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
            'tanggal_sewa' => ['required', 'date'],
            'tanggal_kembali_rencana' => ['required', 'date', 'after_or_equal:tanggal_sewa'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tanggal_sewa.required' => 'Tanggal sewa wajib diisi.',
            'tanggal_sewa.date' => 'Format tanggal sewa tidak valid.',
            'tanggal_kembali_rencana.required' => 'Tanggal rencana kembali wajib diisi.',
            'tanggal_kembali_rencana.date' => 'Format tanggal rencana kembali tidak valid.',
            'tanggal_kembali_rencana.after_or_equal' => 'Tanggal rencana kembali tidak boleh sebelum tanggal sewa.',
        ];
    }
}
