<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Equipment;
use App\Models\Rental;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RentalManagementActionsTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    /**
     * @return array{admin: User, petugas: User, customer: Customer, equipment: Equipment}
     */
    private function createContext(): array
    {
        $admin = User::create([
            'name' => 'Admin Studio',
            'email' => 'admin.aksi@studiorent.id',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $petugas = User::create([
            'name' => 'Petugas Studio',
            'email' => 'petugas.aksi@studiorent.id',
            'password' => bcrypt('password'),
            'role' => 'petugas',
        ]);

        $customer = Customer::factory()->create([
            'status' => 'aktif',
        ]);

        $category = Category::factory()->create();

        $equipment = Equipment::factory()->create([
            'category_id' => $category->id,
            'harga_sewa' => 100000,
            'stok' => 5,
        ]);

        return compact('admin', 'petugas', 'customer', 'equipment');
    }

    public function test_petugas_can_reschedule_rental_and_recalculate_cost_and_status(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-21 10:00:00', 'Asia/Jakarta'));

        ['petugas' => $petugas, 'customer' => $customer, 'equipment' => $equipment] = $this->createContext();
        Sanctum::actingAs($petugas);

        $created = $this->postJson('/api/rentals', [
            'customer_id' => $customer->id,
            'tanggal_sewa' => '2026-11-19',
            'tanggal_kembali_rencana' => '2026-11-20',
            'items' => [
                ['equipment_id' => $equipment->id, 'jumlah' => 2],
            ],
        ])->assertCreated();

        $rentalId = $created->json('data.id');
        $this->assertSame('terlambat', $created->json('data.status'));
        $this->assertSame(200000, $created->json('data.total_biaya'));

        // Perpanjang jatuh tempo ke tanggal 23 (4 hari x 2 unit x 100.000 = 800.000) -> status kembali disewa.
        $rescheduled = $this->putJson("/api/rentals/{$rentalId}", [
            'tanggal_sewa' => '2026-11-19',
            'tanggal_kembali_rencana' => '2026-11-23',
        ]);

        $rescheduled
            ->assertOk()
            ->assertJsonPath('data.status', 'disewa')
            ->assertJsonPath('data.total_biaya', 800000)
            ->assertJsonPath('data.items.0.subtotal', 800000);

        $this->assertDatabaseHas('rentals', [
            'id' => $rentalId,
            'tanggal_sewa' => '2026-11-19',
            'tanggal_kembali_rencana' => '2026-11-23',
            'total_biaya' => 800000,
            'status' => 'disewa',
        ]);
    }

    public function test_reschedule_validates_dates_and_rejects_returned_rental(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-21 10:00:00', 'Asia/Jakarta'));

        ['petugas' => $petugas, 'customer' => $customer, 'equipment' => $equipment] = $this->createContext();
        Sanctum::actingAs($petugas);

        $created = $this->postJson('/api/rentals', [
            'customer_id' => $customer->id,
            'tanggal_sewa' => '2026-11-21',
            'tanggal_kembali_rencana' => '2026-11-22',
            'items' => [
                ['equipment_id' => $equipment->id, 'jumlah' => 1],
            ],
        ])->assertCreated();

        $rentalId = $created->json('data.id');

        $this->putJson("/api/rentals/{$rentalId}", [
            'tanggal_sewa' => '2026-11-22',
            'tanggal_kembali_rencana' => '2026-11-20',
        ])->assertUnprocessable()->assertJsonValidationErrors(['tanggal_kembali_rencana']);

        $this->putJson("/api/rentals/{$rentalId}/kembalikan")->assertOk();

        $this->putJson("/api/rentals/{$rentalId}", [
            'tanggal_sewa' => '2026-11-21',
            'tanggal_kembali_rencana' => '2026-11-24',
        ])->assertUnprocessable()->assertJsonValidationErrors(['status']);
    }

    public function test_petugas_cannot_delete_rental_and_admin_delete_restores_active_stock_without_double_increment(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-21 10:00:00', 'Asia/Jakarta'));

        ['admin' => $admin, 'petugas' => $petugas, 'customer' => $customer, 'equipment' => $equipment] = $this->createContext();

        Sanctum::actingAs($petugas);
        $activeRental = $this->postJson('/api/rentals', [
            'customer_id' => $customer->id,
            'tanggal_sewa' => '2026-11-21',
            'tanggal_kembali_rencana' => '2026-11-22',
            'items' => [
                ['equipment_id' => $equipment->id, 'jumlah' => 2],
            ],
        ])->assertCreated();

        $activeRentalId = $activeRental->json('data.id');
        $this->assertDatabaseHas('equipments', ['id' => $equipment->id, 'stok' => 3]);

        // Petugas harus ditolak (HTTP 403) dan stok tidak boleh berubah.
        $this->deleteJson("/api/rentals/{$activeRentalId}")->assertForbidden();
        $this->assertDatabaseHas('rentals', ['id' => $activeRentalId]);
        $this->assertDatabaseHas('equipments', ['id' => $equipment->id, 'stok' => 3]);

        // Admin menghapus transaksi aktif -> data hilang & stok kembali ke 5.
        Sanctum::actingAs($admin);
        $this->deleteJson("/api/rentals/{$activeRentalId}")->assertOk();

        $this->assertDatabaseMissing('rentals', ['id' => $activeRentalId]);
        $this->assertDatabaseMissing('rental_items', ['rental_id' => $activeRentalId]);
        $this->assertDatabaseHas('equipments', ['id' => $equipment->id, 'stok' => 5]);

        // Buat transaksi lalu kembalikan -> hapus transaksi yang sudah dikembalikan tidak boleh menggandakan stok.
        $returnedRental = $this->postJson('/api/rentals', [
            'customer_id' => $customer->id,
            'tanggal_sewa' => '2026-11-21',
            'tanggal_kembali_rencana' => '2026-11-22',
            'items' => [
                ['equipment_id' => $equipment->id, 'jumlah' => 2],
            ],
        ])->assertCreated();

        $returnedRentalId = $returnedRental->json('data.id');
        $this->putJson("/api/rentals/{$returnedRentalId}/kembalikan")->assertOk();
        $this->assertDatabaseHas('equipments', ['id' => $equipment->id, 'stok' => 5]);

        $this->deleteJson("/api/rentals/{$returnedRentalId}")->assertOk();
        $this->assertDatabaseMissing('rentals', ['id' => $returnedRentalId]);
        $this->assertDatabaseHas('equipments', ['id' => $equipment->id, 'stok' => 5]);
    }
}
