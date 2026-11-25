<?php

namespace App\Http\Requests;

use App\Models\Customer;
use App\Models\Equipment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreRentalRequest extends FormRequest
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
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'tanggal_sewa' => ['required', 'date'],
            'tanggal_kembali_rencana' => ['required', 'date', 'after_or_equal:tanggal_sewa'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.equipment_id' => ['required', 'integer', 'distinct', 'exists:equipments,id'],
            'items.*.jumlah' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'customer_id.required' => 'Penyewa wajib dipilih.',
            'customer_id.integer' => 'Penyewa tidak valid.',
            'customer_id.exists' => 'Data penyewa tidak ditemukan.',
            'tanggal_sewa.required' => 'Tanggal sewa wajib diisi.',
            'tanggal_sewa.date' => 'Format tanggal sewa tidak valid.',
            'tanggal_kembali_rencana.required' => 'Tanggal rencana kembali wajib diisi.',
            'tanggal_kembali_rencana.date' => 'Format tanggal rencana kembali tidak valid.',
            'tanggal_kembali_rencana.after_or_equal' => 'Tanggal rencana kembali tidak boleh sebelum tanggal sewa.',
            'items.required' => 'Minimal harus memilih 1 alat atau ruang studio.',
            'items.array' => 'Daftar alat harus berupa array.',
            'items.min' => 'Minimal harus memilih 1 alat atau ruang studio.',
            'items.*.equipment_id.required' => 'Alat pada setiap baris wajib dipilih.',
            'items.*.equipment_id.integer' => 'ID alat tidak valid.',
            'items.*.equipment_id.distinct' => 'Tidak boleh memilih alat yang sama lebih dari satu kali dalam daftar.',
            'items.*.equipment_id.exists' => 'Salah satu alat yang dipilih tidak ditemukan.',
            'items.*.jumlah.required' => 'Jumlah unit sewa wajib diisi.',
            'items.*.jumlah.integer' => 'Jumlah unit sewa harus berupa angka bulat.',
            'items.*.jumlah.min' => 'Jumlah unit sewa minimal 1.',
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $customerId = $this->input('customer_id');
                if (is_numeric($customerId)) {
                    $customer = Customer::find($customerId);
                    if ($customer && $customer->status !== 'aktif') {
                        $validator->errors()->add('customer_id', 'Penyewa yang dipilih sedang berstatus nonaktif.');
                    }
                }

                $items = $this->input('items');
                if (! is_array($items)) {
                    return;
                }

                $equipmentIds = array_values(array_filter(
                    array_column($items, 'equipment_id'),
                    fn ($id) => is_numeric($id)
                ));

                if ($equipmentIds === []) {
                    return;
                }

                $equipments = Equipment::whereIn('id', $equipmentIds)->get()->keyBy('id');

                foreach ($items as $index => $item) {
                    if (! is_array($item) || ! isset($item['equipment_id'], $item['jumlah']) || ! is_numeric($item['jumlah'])) {
                        continue;
                    }

                    $equipment = $equipments->get((int) $item['equipment_id']);
                    if ($equipment && (int) $item['jumlah'] > $equipment->stok) {
                        $validator->errors()->add(
                            "items.{$index}.jumlah",
                            "Stok {$equipment->nama_alat} tidak mencukupi (tersedia: {$equipment->stok})."
                        );
                    }
                }
            },
        ];
    }
}
