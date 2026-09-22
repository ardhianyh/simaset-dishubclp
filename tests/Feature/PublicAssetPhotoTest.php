<?php

namespace Tests\Feature;

use App\Models\Asset;
use App\Models\AssetDocument;
use App\Models\Ruangan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicAssetPhotoTest extends TestCase
{
    use RefreshDatabase;

    private function aset(): Asset
    {
        $ruangan = Ruangan::create(['nama' => 'PKA']);

        return Asset::create([
            'kib_type' => 'B',
            'nama_barang' => 'P.C Unit',
            'kode_barang' => '1.3.2.10.01.02.001',
            'nomor_register' => '000001',
            'ruangan_id' => $ruangan->id,
            'pj_nama' => 'Aditya Danang P.',
            'asal_usul' => 'Pembelian',
            'harga' => 5000000,
        ]);
    }

    private function dokumen(Asset $asset, string $jenis, string $mime = 'image/jpeg'): AssetDocument
    {
        $file = $mime === 'image/jpeg'
            ? UploadedFile::fake()->image('foto.jpg')
            : UploadedFile::fake()->create('dokumen.pdf', 10, 'application/pdf');

        $path = $file->storeAs("asset-documents/{$asset->id}", $file->hashName(), 'local');

        return $asset->documents()->create([
            'jenis_dokumen' => $jenis,
            'nama_asli' => $file->getClientOriginalName(),
            'nama_file' => $file->hashName(),
            'path' => $path,
            'ukuran_bytes' => 100,
            'mime_type' => $mime,
        ]);
    }

    public function test_halaman_publik_menampilkan_foto_aset(): void
    {
        Storage::fake('local');

        $asset = $this->aset();
        $foto = $this->dokumen($asset, 'Foto');

        $this->get("/p/{$asset->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Assets/Public')
                ->has('fotos', 1)
                ->where('fotos.0.id', $foto->id)
            );

        $this->get("/p/{$asset->id}/foto/{$foto->id}")->assertOk();
    }

    public function test_dokumen_selain_foto_tidak_bisa_diakses_publik(): void
    {
        Storage::fake('local');

        $asset = $this->aset();
        $bast = $this->dokumen($asset, 'BAST', 'application/pdf');

        $this->get("/p/{$asset->id}")
            ->assertOk()
            ->assertInertia(fn ($page) => $page->has('fotos', 0));

        $this->get("/p/{$asset->id}/foto/{$bast->id}")->assertNotFound();
    }

    public function test_foto_milik_aset_lain_tidak_bisa_diakses(): void
    {
        Storage::fake('local');

        $asetA = $this->aset();
        $asetB = Asset::create([
            'kib_type' => 'B',
            'nama_barang' => 'Printer',
            'kode_barang' => '1.3.2.10.02.03.003',
            'nomor_register' => '000002',
            'ruangan_id' => $asetA->ruangan_id,
            'pj_nama' => 'Budi',
            'asal_usul' => 'Pembelian',
            'harga' => 1000000,
        ]);
        $fotoB = $this->dokumen($asetB, 'Foto');

        $this->get("/p/{$asetA->id}/foto/{$fotoB->id}")->assertNotFound();
    }
}
