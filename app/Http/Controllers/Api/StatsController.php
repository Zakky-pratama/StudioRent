<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Equipment;
use App\Models\Rental;
use App\Models\RentalItem;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $totalTersedia = (int) Equipment::sum('stok');
        $totalDisewa = (int) RentalItem::whereHas(
            'rental',
            fn ($query) => $query->whereIn('status', ['disewa', 'terlambat'])
        )->sum('jumlah');

        return response()->json([
            'total_alat' => $totalTersedia + $totalDisewa,
            'total_tersedia' => $totalTersedia,
            'total_disewa' => $totalDisewa,
            'total_penyewa' => Customer::count(),
            'transaksi_aktif' => Rental::whereIn('status', ['disewa', 'terlambat'])->count(),
            'tenggat_hari_ini' => Rental::whereIn('status', ['disewa', 'terlambat'])
                ->whereDate('tanggal_kembali_rencana', '<=', now()->toDateString())
                ->count(),
            'pendapatan_bulan_ini' => (int) Rental::whereMonth('tanggal_sewa', now()->month)
                ->whereYear('tanggal_sewa', now()->year)
                ->sum('total_biaya'),
        ]);
    }
}
