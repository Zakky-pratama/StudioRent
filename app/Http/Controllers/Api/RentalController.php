<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRentalRequest;
use App\Http\Requests\UpdateRentalRequest;
use App\Http\Resources\RentalResource;
use App\Models\Equipment;
use App\Models\Rental;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RentalController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        Rental::syncOverdueStatuses();

        $query = Rental::with(['customer', 'user', 'rentalItems.equipment'])
            ->orderByDesc('id');

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->query('search'));
            $numericId = ltrim(str_ireplace('#RNT-', '', $search), '0');

            $query->where(function ($builder) use ($search, $numericId): void {
                if ($numericId !== '' && ctype_digit($numericId)) {
                    $builder->where('id', (int) $numericId);
                }

                $builder->orWhereHas('customer', function ($customerQuery) use ($search): void {
                    $customerQuery->where('nama', 'like', "%{$search}%")
                        ->orWhere('nim_nik', 'like', "%{$search}%")
                        ->orWhere('instansi', 'like', "%{$search}%");
                })->orWhereHas('rentalItems.equipment', function ($equipmentQuery) use ($search): void {
                    $equipmentQuery->where('nama_alat', 'like', "%{$search}%");
                });
            });
        }

        $perPage = min(100, max(1, (int) $request->integer('per_page', 10)));

        return RentalResource::collection($query->paginate($perPage));
    }

    public function show(string $id): RentalResource
    {
        Rental::syncOverdueStatuses();

        $rental = Rental::with(['customer', 'user', 'rentalItems.equipment'])->findOrFail($id);

        return new RentalResource($rental);
    }

    public function store(StoreRentalRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $rental = DB::transaction(function () use ($validated, $request): Rental {
            $equipmentIds = array_column($validated['items'], 'equipment_id');
            $equipments = Equipment::whereIn('id', $equipmentIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $tanggalSewa = Carbon::parse($validated['tanggal_sewa']);
            $tanggalRencana = Carbon::parse($validated['tanggal_kembali_rencana']);
            $durasiHari = Rental::calculateDurationDays($tanggalSewa, $tanggalRencana);

            $totalBiaya = 0;
            $detailItems = [];

            foreach ($validated['items'] as $index => $item) {
                $equipment = $equipments->get((int) $item['equipment_id']);
                $jumlah = (int) $item['jumlah'];

                if (! $equipment || $equipment->stok < $jumlah) {
                    $namaAlat = $equipment?->nama_alat ?? 'Alat';
                    $stokTersedia = $equipment?->stok ?? 0;

                    throw ValidationException::withMessages([
                        "items.{$index}.jumlah" => [
                            "Stok {$namaAlat} tidak mencukupi (tersedia: {$stokTersedia}).",
                        ],
                    ]);
                }

                $hargaSatuan = (int) $equipment->harga_sewa;
                $subtotal = $hargaSatuan * $jumlah * $durasiHari;
                $totalBiaya += $subtotal;

                $equipment->decrement('stok', $jumlah);

                $detailItems[] = [
                    'equipment_id' => $equipment->id,
                    'jumlah' => $jumlah,
                    'harga_satuan' => $hargaSatuan,
                    'subtotal' => $subtotal,
                ];
            }

            $rental = Rental::create([
                'customer_id' => $validated['customer_id'],
                'user_id' => $request->user()->id,
                'tanggal_sewa' => $tanggalSewa->toDateString(),
                'tanggal_kembali_rencana' => $tanggalRencana->toDateString(),
                'total_biaya' => $totalBiaya,
                'status' => Rental::resolveInitialStatus($tanggalRencana),
            ]);

            foreach ($detailItems as $detail) {
                $rental->rentalItems()->create($detail);
            }

            return $rental;
        });

        $rental->load(['customer', 'user', 'rentalItems.equipment']);

        return (new RentalResource($rental))
            ->response()
            ->setStatusCode(201);
    }

    public function kembalikan(string $id): RentalResource
    {
        $rental = DB::transaction(function () use ($id): Rental {
            $rental = Rental::with(['rentalItems.equipment'])
                ->lockForUpdate()
                ->findOrFail($id);

            if ($rental->status === 'dikembalikan') {
                throw ValidationException::withMessages([
                    'status' => ['Transaksi penyewaan ini sudah dikembalikan sebelumnya.'],
                ]);
            }

            $rental->update([
                'status' => 'dikembalikan',
                'tanggal_dikembalikan' => now()->toDateString(),
            ]);

            foreach ($rental->rentalItems as $item) {
                $item->equipment?->increment('stok', (int) $item->jumlah);
            }

            return $rental;
        });

        $rental->refresh()->load(['customer', 'user', 'rentalItems.equipment']);

        return new RentalResource($rental);
    }

    public function update(UpdateRentalRequest $request, string $id): RentalResource
    {
        $validated = $request->validated();

        $rental = DB::transaction(function () use ($validated, $id): Rental {
            $rental = Rental::with(['rentalItems'])
                ->lockForUpdate()
                ->findOrFail($id);

            if ($rental->status === 'dikembalikan') {
                throw ValidationException::withMessages([
                    'status' => ['Transaksi yang sudah dikembalikan tidak dapat diubah jadwalnya.'],
                ]);
            }

            $tanggalSewa = Carbon::parse($validated['tanggal_sewa']);
            $tanggalRencana = Carbon::parse($validated['tanggal_kembali_rencana']);
            $durasiHari = Rental::calculateDurationDays($tanggalSewa, $tanggalRencana);

            $totalBiaya = 0;
            foreach ($rental->rentalItems as $item) {
                $subtotal = (int) $item->harga_satuan * (int) $item->jumlah * $durasiHari;
                $item->update(['subtotal' => $subtotal]);
                $totalBiaya += $subtotal;
            }

            $rental->update([
                'tanggal_sewa' => $tanggalSewa->toDateString(),
                'tanggal_kembali_rencana' => $tanggalRencana->toDateString(),
                'total_biaya' => $totalBiaya,
                'status' => Rental::resolveInitialStatus($tanggalRencana),
            ]);

            return $rental;
        });

        $rental->refresh()->load(['customer', 'user', 'rentalItems.equipment']);

        return new RentalResource($rental);
    }

    public function destroy(string $id): JsonResponse
    {
        DB::transaction(function () use ($id): void {
            $rental = Rental::with(['rentalItems.equipment'])
                ->lockForUpdate()
                ->findOrFail($id);

            // Hanya kembalikan stok jika transaksi masih berjalan agar stok alat yang sudah dikembalikan tidak ganda.
            if ($rental->status !== 'dikembalikan') {
                foreach ($rental->rentalItems as $item) {
                    $item->equipment?->increment('stok', (int) $item->jumlah);
                }
            }

            $rental->rentalItems()->delete();
            $rental->delete();
        });

        return response()->json([
            'message' => 'Transaksi penyewaan berhasil dihapus.',
        ]);
    }
}
