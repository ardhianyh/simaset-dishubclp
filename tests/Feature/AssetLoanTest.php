<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetLoan;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssetLoanTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    private function staffRuangan(Ruangan $ruangan): User
    {
        $user = User::factory()->create(['role' => 'staff']);
        $user->ruangans()->attach($ruangan->id);

        return $user;
    }

    private function aset(Ruangan $ruangan): Asset
    {
        return Asset::create([
            'kib_type' => 'B',
            'nama_barang' => 'Kamera',
            'kode_barang' => '1.3.2.06.01.02.001',
            'nomor_register' => '000001',
            'ruangan_id' => $ruangan->id,
            'pj_nama' => 'Budi',
            'asal_usul' => 'Pembelian',
            'harga' => 8000000,
        ]);
    }

    private function dataPinjam(Ruangan $asal, Ruangan $peminjam, Asset $asset): array
    {
        return [
            'ruangan_asal_id' => $asal->id,
            'asset_ids' => [$asset->id],
            'peminjam_nama' => 'Siti',
            'peminjam_nip' => '19850101 201001 2 001',
            'peminjam_ruangan_id' => $peminjam->id,
            'keperluan' => 'Dokumentasi sosialisasi',
            'dipinjam_pada' => '2026-09-24T08:00',
            'rencana_kembali' => '2026-09-25T16:00',
        ];
    }

    public function test_pengurus_barang_pemilik_mencatat_peminjaman_tanpa_memindahkan_barang(): void
    {
        $umum = Ruangan::create(['nama' => 'Bagian Umum']);
        $angkutan = Ruangan::create(['nama' => 'Bidang Angkutan']);
        $asset = $this->aset($umum);

        $this->actingAs($this->staffRuangan($umum))
            ->post('/peminjaman', $this->dataPinjam($umum, $angkutan, $asset))
            ->assertRedirect('/peminjaman');

        $loan = AssetLoan::first();
        $this->assertSame('Bidang Angkutan', $loan->peminjam_ruangan_nama);
        $this->assertSame('Bagian Umum', $loan->ruangan_asal_nama);
        $this->assertSame('2026-09-24 08:00', $loan->dipinjam_pada->format('Y-m-d H:i'));
        $this->assertNull($loan->dikembalikan_pada);

        $asset->refresh();
        $this->assertSame($umum->id, $asset->ruangan_id);
        $this->assertSame('Budi', $asset->pj_nama);
    }

    public function test_barang_yang_masih_dipinjam_tidak_bisa_dipinjam_lagi(): void
    {
        $umum = Ruangan::create(['nama' => 'Bagian Umum']);
        $angkutan = Ruangan::create(['nama' => 'Bidang Angkutan']);
        $asset = $this->aset($umum);
        $staff = $this->staffRuangan($umum);

        $this->actingAs($staff)->post('/peminjaman', $this->dataPinjam($umum, $angkutan, $asset));
        $this->actingAs($staff)->post('/peminjaman', $this->dataPinjam($umum, $angkutan, $asset))
            ->assertStatus(422);

        $this->assertSame(1, AssetLoan::count());
    }

    public function test_staff_tidak_bisa_meminjamkan_barang_ruangan_lain(): void
    {
        $umum = Ruangan::create(['nama' => 'Bagian Umum']);
        $angkutan = Ruangan::create(['nama' => 'Bidang Angkutan']);
        $asset = $this->aset($umum);

        $this->actingAs($this->staffRuangan($angkutan))
            ->post('/peminjaman', $this->dataPinjam($umum, $angkutan, $asset))
            ->assertForbidden();

        $this->assertSame(0, AssetLoan::count());
    }

    public function test_pengembalian_dicatat_pemilik_dan_peminjam_bisa_melihat(): void
    {
        $umum = Ruangan::create(['nama' => 'Bagian Umum']);
        $angkutan = Ruangan::create(['nama' => 'Bidang Angkutan']);
        $lain = Ruangan::create(['nama' => 'Bidang Lalu Lintas']);
        $asset = $this->aset($umum);
        $pemilik = $this->staffRuangan($umum);
        $peminjam = $this->staffRuangan($angkutan);

        $this->actingAs($pemilik)->post('/peminjaman', $this->dataPinjam($umum, $angkutan, $asset));
        $loan = AssetLoan::first();

        // Staff ruangan peminjam melihat catatannya, tapi tidak boleh mencatat pengembalian.
        $this->actingAs($peminjam)->get('/peminjaman')
            ->assertInertia(fn ($page) => $page->has('loans.data', 1)
                ->where('loans.data.0.can_manage', false));
        $this->actingAs($peminjam)
            ->post("/peminjaman/{$loan->id}/kembali", ['dikembalikan_pada' => '2026-09-25T15:00'])
            ->assertForbidden();

        // Ruangan yang tidak terlibat tidak melihat apa pun.
        $this->actingAs($this->staffRuangan($lain))->get('/peminjaman')
            ->assertInertia(fn ($page) => $page->has('loans.data', 0));

        $this->actingAs($pemilik)
            ->post("/peminjaman/{$loan->id}/kembali", [
                'dikembalikan_pada' => '2026-09-25T15:00',
                'catatan_kembali' => 'Kondisi baik',
            ])
            ->assertRedirect();

        $loan->refresh();
        $this->assertSame('2026-09-25 15:00', $loan->dikembalikan_pada->format('Y-m-d H:i'));
        $this->assertSame($pemilik->id, $loan->returned_by);

        // Setelah kembali, barang bisa dipinjam lagi.
        $this->actingAs($pemilik)->post('/peminjaman', $this->dataPinjam($umum, $angkutan, $asset))
            ->assertRedirect('/peminjaman');
        $this->assertSame(2, AssetLoan::count());
    }

    public function test_waktu_kembali_tidak_boleh_sebelum_waktu_pinjam(): void
    {
        $umum = Ruangan::create(['nama' => 'Bagian Umum']);
        $angkutan = Ruangan::create(['nama' => 'Bidang Angkutan']);
        $asset = $this->aset($umum);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/peminjaman', $this->dataPinjam($umum, $angkutan, $asset));
        $loan = AssetLoan::first();

        $this->actingAs($admin)
            ->post("/peminjaman/{$loan->id}/kembali", ['dikembalikan_pada' => '2026-09-23T15:00'])
            ->assertSessionHasErrors('dikembalikan_pada');

        $this->assertNull($loan->fresh()->dikembalikan_pada);
    }

    public function test_form_pinjam_dan_detail_aset_menandai_barang_yang_sedang_dipinjam(): void
    {
        $umum = Ruangan::create(['nama' => 'Bagian Umum']);
        $angkutan = Ruangan::create(['nama' => 'Bidang Angkutan']);
        $asset = $this->aset($umum);
        $staff = $this->staffRuangan($umum);

        $this->actingAs($staff)->post('/peminjaman', $this->dataPinjam($umum, $angkutan, $asset));

        $this->actingAs($staff)->get("/peminjaman/create?asset_id={$asset->id}")
            ->assertInertia(fn ($page) => $page->component('Peminjaman/Create')
                ->where('ruanganAsalId', $umum->id)
                ->has('ruanganAsalOptions', 1)
                ->where('assets.0.sedang_dipinjam', true));

        $this->actingAs($staff)->get("/assets/kib-b/{$asset->id}")
            ->assertInertia(fn ($page) => $page->has('riwayatPeminjaman', 1)
                ->where('riwayatPeminjaman.0.dipinjam_pada', '2026-09-24 08:00'));
    }
}
