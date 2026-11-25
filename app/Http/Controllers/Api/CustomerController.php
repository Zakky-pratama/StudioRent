<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Customer::withCount('rentals')->orderByDesc('id');

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($builder) use ($search): void {
                $builder->where('nama', 'like', "%{$search}%")
                    ->orWhere('nim_nik', 'like', "%{$search}%")
                    ->orWhere('instansi', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $perPage = min(100, max(1, (int) $request->integer('per_page', 10)));

        return CustomerResource::collection($query->paginate($perPage));
    }

    public function show(string $id): CustomerResource
    {
        $customer = Customer::withCount('rentals')->findOrFail($id);

        return new CustomerResource($customer);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['status'] = $validated['status'] ?? 'aktif';

        $customer = Customer::create($validated);

        return (new CustomerResource($customer->loadCount('rentals')))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateCustomerRequest $request, string $id): CustomerResource
    {
        $customer = Customer::findOrFail($id);
        $customer->update($request->validated());

        return new CustomerResource($customer->loadCount('rentals'));
    }

    public function destroy(string $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        if ($customer->rentals()->exists()) {
            return response()->json([
                'message' => 'Penyewa tidak dapat dihapus karena memiliki riwayat transaksi penyewaan.',
            ], 422);
        }

        $customer->delete();

        return response()->json([
            'message' => 'Data penyewa berhasil dihapus.',
        ]);
    }
}
