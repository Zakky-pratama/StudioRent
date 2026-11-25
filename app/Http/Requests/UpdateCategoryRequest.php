<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
        $categoryId = $this->route('id') ?? $this->route('category');

        return [
            'nama_kategori' => [
                'required',
                'string',
                'max:100',
                Rule::unique('categories', 'nama_kategori')->ignore($categoryId),
            ],
            'deskripsi' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.string' => 'Nama kategori harus berupa teks.',
            'nama_kategori.max' => 'Nama kategori maksimal 100 karakter.',
            'nama_kategori.unique' => 'Nama kategori sudah terdaftar.',
            'deskripsi.string' => 'Deskripsi kategori harus berupa teks.',
        ];
    }
}
