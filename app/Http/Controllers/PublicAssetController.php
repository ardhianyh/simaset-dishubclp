<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetDocument;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PublicAssetController extends Controller
{
    public function show(Asset $asset)
    {
        $asset->load(['ruangan', 'detail']);

        return Inertia::render('Assets/Public', [
            'asset' => [
                'nama_barang' => $asset->nama_barang,
                'kode_barang' => $asset->kode_barang,
                'kib_type' => $asset->kib_type,
                'kib_label' => Asset::KIB_LABELS[$asset->kib_type] ?? '',
                'lokasi' => $asset->ruangan?->nama ?? '-',
                'pj_nama' => $asset->pj_nama,
                'pj_nip' => $asset->pj_nip,
            ],
            // File yang hilang dilewati supaya halaman tidak menampilkan gambar rusak.
            'fotos' => $this->fotoQuery($asset)
                ->get(['id', 'nama_asli', 'path'])
                ->filter(fn (AssetDocument $foto) => Storage::disk('local')->exists($foto->path))
                ->map(fn (AssetDocument $foto) => [
                    'id' => $foto->id,
                    'nama' => $foto->nama_asli,
                    'url' => route('public.asset.foto', [$asset, $foto]),
                ])
                ->values(),
        ]);
    }

    /**
     * Sajikan foto aset untuk halaman publik hasil scan QR.
     * Hanya dokumen berjenis "Foto" yang boleh diakses tanpa login —
     * dokumen lain (BAST, sertifikat, SK) tetap tertutup.
     */
    public function foto(Asset $asset, AssetDocument $document)
    {
        $isFoto = $this->fotoQuery($asset)->whereKey($document->id)->exists();

        if (! $isFoto || ! Storage::disk('local')->exists($document->path)) {
            abort(404);
        }

        return Storage::disk('local')->response(
            $document->path,
            $document->nama_asli,
            ['Cache-Control' => 'public, max-age=86400']
        );
    }

    private function fotoQuery(Asset $asset)
    {
        return $asset->documents()
            ->where('jenis_dokumen', 'Foto')
            ->where('mime_type', 'like', 'image/%')
            ->orderBy('id');
    }
}
