<?php

namespace App\Models;

use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasFactory;

    protected $fillable = [
        'nama',
        'nim_nik',
        'instansi',
        'email',
        'nomor_telepon',
        'alamat',
        'status',
    ];

    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }
}
