<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Inertia\Inertia;

class PublicAssetController extends Controller
{
    public function show(Asset $asset)
    {
        $asset->load(['wilayah', 'detail']);

        return Inertia::render('Assets/Public', [
            'asset' => [
                'nama_barang' => $asset->nama_barang,
                'kode_barang' => $asset->kode_barang,
                'kib_type' => $asset->kib_type,
                'kib_label' => Asset::KIB_LABELS[$asset->kib_type] ?? '',
                'lokasi' => $asset->wilayah?->nama ?? '-',
                'pj_nama' => $asset->pj_nama,
                'pj_nip' => $asset->pj_nip,
            ],
        ]);
    }
}
