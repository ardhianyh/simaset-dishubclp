<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetMutation;
use App\Models\KibBDetail;
use App\Models\Ruangan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AssetMutationTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function ruangan(string $nama, string $pj): Ruangan
    {
        return Ruangan::create([
            'nama' => $nama,
            'pj_nama' => $pj,
            'pj_nip' => '19800101 200001 1 001',
        ]);
    }

    private function aset(Ruangan $ruangan, int $tahun = 2020): Asset
    {
        $asset = Asset::create([
            'kib_type' => 'B',
            'nama_barang' => 'Printer',
            'kode_barang' => '1.3.2.10.02.03.003',
            'nomor_register' => '000001',
            'ruangan_id' => $ruangan->id,
            'pj_nama' => $ruangan->pj_nama,
            'pj_nip' => $ruangan->pj_nip,
            'asal_usul' => 'Pembelian',
            'harga' => 2000000,
        ]);

        KibBDetail::create([
            'asset_id' => $asset->id,
            'tahun_pembelian' => $tahun,
        ]);

        return $asset;
    }

    public function test_barang_pindah_ruangan_dan_ganti_pj_setelah_bast_diunggah(): void
    {
        Storage::fake('local');

        $pka = $this->ruangan('PKA', 'Budi');
        $angkutan = $this->ruangan('Bidang Angkutan', 'Siti');
        $asset = $this->aset($pka);

        $response = $this->actingAs($this->admin())->post('/mutasi', [
            'nomor_bast' => '000.3.2/001/21/2026',
            'tanggal' => '2026-02-12',
            'ruangan_asal_id' => $pka->id,
            'ruangan_tujuan_id' => $angkutan->id,
            'asset_ids' => [$asset->id],
            'pj_asal_nama' => 'Budi',
            'pj_tujuan_nama' => 'Siti',
            'dokumen' => UploadedFile::fake()->create('bast.pdf', 100, 'application/pdf'),
        ]);

        $response->assertRedirect();

        $asset->refresh();
        $this->assertSame($angkutan->id, $asset->ruangan_id);
        $this->assertSame('Siti', $asset->pj_nama);

        $mutation = AssetMutation::first();
        $this->assertSame('PKA', $mutation->ruangan_asal_nama);
        $this->assertSame('Bidang Angkutan', $mutation->ruangan_tujuan_nama);
        $this->assertCount(1, $mutation->items);
        $this->assertSame('Budi', $mutation->items->first()->pj_asal_nama);
        $this->assertCount(1, $mutation->documents);
        Storage::disk('local')->assertExists($mutation->documents->first()->path);
    }

    public function test_barang_tidak_pindah_tanpa_dokumen_bast(): void
    {
        $pka = $this->ruangan('PKA', 'Budi');
        $angkutan = $this->ruangan('Bidang Angkutan', 'Siti');
        $asset = $this->aset($pka);

        $response = $this->actingAs($this->admin())->post('/mutasi', [
            'nomor_bast' => '000.3.2/001/21/2026',
            'tanggal' => '2026-02-12',
            'ruangan_asal_id' => $pka->id,
            'ruangan_tujuan_id' => $angkutan->id,
            'asset_ids' => [$asset->id],
        ]);

        $response->assertSessionHasErrors('dokumen');
        $this->assertSame($pka->id, $asset->refresh()->ruangan_id);
        $this->assertSame(0, AssetMutation::count());
    }

    public function test_ganti_pj_di_ruangan_yang_sama_wajib_mengisi_pj_baru(): void
    {
        Storage::fake('local');

        $pka = $this->ruangan('PKA', 'Budi');
        $asset = $this->aset($pka);

        $this->actingAs($this->admin())->post('/mutasi', [
            'nomor_bast' => 'X',
            'tanggal' => '2026-02-12',
            'ruangan_asal_id' => $pka->id,
            'ruangan_tujuan_id' => $pka->id,
            'asset_ids' => [$asset->id],
            'dokumen' => UploadedFile::fake()->create('bast.pdf', 10, 'application/pdf'),
        ])->assertSessionHasErrors('pj_tujuan_nama');
    }

    public function test_ganti_pj_di_ruangan_yang_sama_tidak_memindahkan_barang(): void
    {
        Storage::fake('local');

        $pka = $this->ruangan('PKA', 'Budi');
        $asset = $this->aset($pka);

        $this->actingAs($this->admin())->post('/mutasi', [
            'nomor_bast' => '000.3.2/002/21/2026',
            'tanggal' => '2026-03-01',
            'ruangan_asal_id' => $pka->id,
            'ruangan_tujuan_id' => $pka->id,
            'asset_ids' => [$asset->id],
            'pj_asal_nama' => 'Budi',
            'pj_tujuan_nama' => 'Andi',
            'pj_tujuan_nip' => '19900101 201001 1 002',
            'dokumen' => UploadedFile::fake()->create('bast.pdf', 10, 'application/pdf'),
        ])->assertRedirect();

        $asset->refresh();
        $this->assertSame($pka->id, $asset->ruangan_id);
        $this->assertSame('Andi', $asset->pj_nama);
        $this->assertSame('19900101 201001 1 002', $asset->pj_nip);

        $mutation = AssetMutation::first();
        $this->assertSame(AssetMutation::JENIS_GANTI_PJ, $mutation->jenis);
        $this->assertSame('Budi', $mutation->items->first()->pj_asal_nama);

        $this->get("/mutasi/{$mutation->id}/bast")->assertOk();
    }

    public function test_staff_tidak_bisa_menggeser_barang(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        $this->actingAs($staff)->get('/mutasi')->assertForbidden();
        $this->actingAs($staff)->post('/mutasi', [])->assertForbidden();
    }

    public function test_kir_menampilkan_posisi_barang_pada_tanggal_yang_diminta(): void
    {
        Storage::fake('local');

        $pka = $this->ruangan('PKA', 'Budi');
        $angkutan = $this->ruangan('Bidang Angkutan', 'Siti');
        $asset = $this->aset($pka);
        $admin = $this->admin();

        $this->actingAs($admin)->post('/mutasi', [
            'nomor_bast' => '000.3.2/001/21/2026',
            'tanggal' => '2026-02-12',
            'ruangan_asal_id' => $pka->id,
            'ruangan_tujuan_id' => $angkutan->id,
            'asset_ids' => [$asset->id],
            'dokumen' => UploadedFile::fake()->create('bast.pdf', 10, 'application/pdf'),
        ]);

        // Per 1 Januari 2026 barang masih tercatat di PKA, belum di Bidang Angkutan.
        $this->actingAs($admin)
            ->get("/export/kir-ruangan/{$pka->id}?per_tanggal=2026-01-01")
            ->assertOk();

        $kirPka = $this->kirAssetIds($pka, '2026-01-01');
        $kirAngkutan = $this->kirAssetIds($angkutan, '2026-01-01');

        $this->assertContains($asset->id, $kirPka);
        $this->assertNotContains($asset->id, $kirAngkutan);

        // Per hari pergeseran dan sesudahnya, barang sudah pindah.
        $this->assertNotContains($asset->id, $this->kirAssetIds($pka, '2026-03-01'));
        $this->assertContains($asset->id, $this->kirAssetIds($angkutan, '2026-03-01'));
    }

    public function test_barang_yang_diperoleh_setelah_tanggal_kir_tidak_ikut_tercetak(): void
    {
        $pka = $this->ruangan('PKA', 'Budi');
        $asset = $this->aset($pka, tahun: 2026);

        $this->assertNotContains($asset->id, $this->kirAssetIds($pka, '2025-01-01'));
        $this->assertContains($asset->id, $this->kirAssetIds($pka, '2026-01-01'));
    }

    /**
     * @return array<int, int>
     */
    private function kirAssetIds(Ruangan $ruangan, string $perTanggal): array
    {
        $method = new \ReflectionMethod(\App\Http\Controllers\ExportController::class, 'assetsPadaTanggal');

        return $method->invoke(
            app(\App\Http\Controllers\ExportController::class),
            $ruangan,
            \Carbon\Carbon::parse($perTanggal)
        )->pluck('id')->all();
    }
}
