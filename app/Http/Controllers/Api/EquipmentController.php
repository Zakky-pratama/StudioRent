<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEquipmentRequest;
use App\Http\Requests\UpdateEquipmentRequest;
use App\Http\Resources\EquipmentResource;
use App\Models\Equipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EquipmentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Equipment::with('category')->orderBy('id');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($builder) use ($search): void {
                $builder->where('nama_alat', 'like', "%{$search}%")
                    ->orWhere('merk', 'like', "%{$search}%")
                    ->orWhere('spesifikasi', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->boolean('available_only')) {
            $query->where('stok', '>', 0);
        }

        $perPage = min(100, max(1, (int) $request->integer('per_page', 12)));

        return EquipmentResource::collection($query->paginate($perPage));
    }

    public function show(string $id): EquipmentResource
    {
        $equipment = Equipment::with('category')->findOrFail($id);

        return new EquipmentResource($equipment);
    }

    public function store(StoreEquipmentRequest $request): JsonResponse
    {
        $equipment = Equipment::create($request->validated());

        return (new EquipmentResource($equipment->load('category')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateEquipmentRequest $request, string $id): EquipmentResource
    {
        $equipment = Equipment::findOrFail($id);
        $equipment->update($request->validated());

        return new EquipmentResource($equipment->load('category'));
    }

    public function destroy(string $id): JsonResponse
    {
        $equipment = Equipment::findOrFail($id);

        if ($equipment->rentalItems()->exists()) {
            return response()->json([
                'message' => 'Alat tidak dapat dihapus karena memiliki riwayat transaksi penyewaan.',
            ], 422);
        }

        $equipment->delete();

        return response()->json([
            'message' => 'Alat berhasil dihapus.',
        ]);
    }
}
