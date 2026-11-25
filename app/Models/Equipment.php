<?php

namespace App\Models;

use Database\Factories\EquipmentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipment extends Model
{
    /** @use HasFactory<EquipmentFactory> */
    use HasFactory;

    // Eksplisit karena 'equipment' bersifat uncountable pada pluralizer Laravel.
    protected $table = 'equipments';

    protected $fillable = [
        'category_id',
        'nama_alat',
        'merk',
        'spesifikasi',
        'kondisi',
        'harga_sewa',
        'satuan_sewa',
        'stok',
        'gambar',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'harga_sewa' => 'integer',
            'stok' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function rentalItems(): HasMany
    {
        return $this->hasMany(RentalItem::class);
    }
}
