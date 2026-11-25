<?php

namespace App\Models;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use Database\Factories\RentalFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rental extends Model
{
    /** @use HasFactory<RentalFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'user_id',
        'tanggal_sewa',
        'tanggal_kembali_rencana',
        'tanggal_dikembalikan',
        'total_biaya',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_biaya' => 'integer',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function rentalItems(): HasMany
    {
        return $this->hasMany(RentalItem::class);
    }

    /**
     * Filter aktif yang sudah melewati batas tanggal rencana kembali.
     */
    public function scopeOverdueCandidates(Builder $query, ?string $referenceDate = null): Builder
    {
        $cutoffDate = $referenceDate ?? now()->toDateString();

        return $query
            ->where('status', 'disewa')
            ->where('tanggal_kembali_rencana', '<', $cutoffDate);
    }

    /**
     * Sinkronkan status penyewaan aktif yang melewati jatuh tempo menjadi terlambat.
     */
    public static function syncOverdueStatuses(): int
    {
        // Pre-check read-only menghindari write lock saat tidak ada transaksi jatuh tempo.
        if (! static::overdueCandidates()->exists()) {
            return 0;
        }

        return static::overdueCandidates()->update(['status' => 'terlambat']);
    }

    /**
     * Tentukan status awal saat transaksi dicatat, termasuk input tanggal mundur.
     */
    public static function resolveInitialStatus(CarbonInterface|string $tanggalKembaliRencana): string
    {
        $dueDate = Carbon::parse($tanggalKembaliRencana)->toDateString();

        return $dueDate < now()->toDateString() ? 'terlambat' : 'disewa';
    }

    /**
     * Hitung durasi sewa dalam satuan hari (minimal 1 hari).
     */
    public static function calculateDurationDays(
        CarbonInterface|string $tanggalSewa,
        CarbonInterface|string $tanggalKembaliRencana
    ): int {
        $start = Carbon::parse($tanggalSewa)->startOfDay();
        $end = Carbon::parse($tanggalKembaliRencana)->startOfDay();

        return max(1, (int) $start->diffInDays($end));
    }
}
