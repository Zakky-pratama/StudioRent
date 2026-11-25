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

class RentalOverdueStatusTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    /**
     * @return array{petugas: User, customer: Customer, equipment: Equipment}
     */
    private function createContext(): array
    {
        $petugas = User::create([
            'name' => 'Petugas Uji',
            'email' => 'petugas.uji@studiorent.id',
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

        return compact('petugas', 'customer', 'equipment');
    }

    public function test_backdated_rental_with_past_due_date_is_immediately_marked_terlambat_and_can_be_returned(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-21 10:00:00', 'Asia/Jakarta'));

        ['petugas' => $petugas, 'customer' => $customer, 'equipment' => $equipment] = $this->createContext();
        Sanctum::actingAs($petugas);

        $storeResponse = $this->postJson('/api/rentals', [
            'customer_id' => $customer->id,
            'tanggal_sewa' => '2026-11-19',
            'tanggal_kembali_rencana' => '2026-11-20',
            'items' => [
                ['equipment_id' => $equipment->id, 'jumlah' => 2],
            ],
        ]);

        $storeResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'terlambat')
            ->assertJsonPath('data.total_biaya', 200000);

        $rentalId = $storeResponse->json('data.id');

        $this->assertDatabaseHas('rentals', [
            'id' => $rentalId,
            'status' => 'terlambat',
        ]);
        $this->assertDatabaseHas('equipments', [
            'id' => $equipment->id,
            'stok' => 3,
        ]);

        $returnResponse = $this->putJson("/api/rentals/{$rentalId}/kembalikan");

        $returnResponse
            ->assertOk()
            ->assertJsonPath('data.status', 'dikembalikan')
            ->assertJsonPath('data.tanggal_dikembalikan', '2026-11-21');

        $this->assertDatabaseHas('equipments', [
            'id' => $equipment->id,
            'stok' => 5,
        ]);
    }

    public function test_rental_due_today_stays_disewa_until_next_day_then_syncs_on_index(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-21 10:00:00', 'Asia/Jakarta'));

        ['petugas' => $petugas, 'customer' => $customer, 'equipment' => $equipment] = $this->createContext();
        Sanctum::actingAs($petugas);

        $storeResponse = $this->postJson('/api/rentals', [
            'customer_id' => $customer->id,
            'tanggal_sewa' => '2026-11-19',
            'tanggal_kembali_rencana' => '2026-11-21',
            'items' => [
                ['equipment_id' => $equipment->id, 'jumlah' => 1],
            ],
        ]);

        $storeResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'disewa');

        $rentalId = $storeResponse->json('data.id');

        $this->getJson('/api/rentals?status=disewa')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $rentalId);

        Carbon::setTestNow(Carbon::parse('2026-11-22 00:05:00', 'Asia/Jakarta'));

        $this->getJson('/api/rentals?status=terlambat')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $rentalId)
            ->assertJsonPath('data.0.status', 'terlambat');

        $this->assertDatabaseHas('rentals', [
            'id' => $rentalId,
            'status' => 'terlambat',
        ]);
    }

    public function test_stats_and_show_endpoints_sync_overdue_rentals_and_preserve_returned_status(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-21 09:00:00', 'Asia/Jakarta'));

        ['petugas' => $petugas, 'customer' => $customer] = $this->createContext();
        Sanctum::actingAs($petugas);

        $overdueViaStats = Rental::create([
            'customer_id' => $customer->id,
            'user_id' => $petugas->id,
            'tanggal_sewa' => '2026-11-18',
            'tanggal_kembali_rencana' => '2026-11-20',
            'total_biaya' => 100000,
            'status' => 'disewa',
        ]);

        $returnedRental = Rental::create([
            'customer_id' => $customer->id,
            'user_id' => $petugas->id,
            'tanggal_sewa' => '2026-11-17',
            'tanggal_kembali_rencana' => '2026-11-19',
            'tanggal_dikembalikan' => '2026-11-19',
            'total_biaya' => 100000,
            'status' => 'dikembalikan',
        ]);

        $this->getJson('/api/stats')
            ->assertOk()
            ->assertJsonPath('transaksi_aktif', 1)
            ->assertJsonPath('tenggat_hari_ini', 1);

        $this->assertDatabaseHas('rentals', [
            'id' => $overdueViaStats->id,
            'status' => 'terlambat',
        ]);
        $this->assertDatabaseHas('rentals', [
            'id' => $returnedRental->id,
            'status' => 'dikembalikan',
        ]);

        $overdueViaShow = Rental::create([
            'customer_id' => $customer->id,
            'user_id' => $petugas->id,
            'tanggal_sewa' => '2026-11-18',
            'tanggal_kembali_rencana' => '2026-11-20',
            'total_biaya' => 150000,
            'status' => 'disewa',
        ]);

        $this->getJson("/api/rentals/{$overdueViaShow->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'terlambat');
    }
}
