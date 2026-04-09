<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Wilayah;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetSearchController extends Controller
{
    public function index(Request $request)
    {
        $query = Asset::with('wilayah:id,nama');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'ilike', "%{$search}%")
                  ->orWhere('kode_barang', 'ilike', "%{$search}%")
                  ->orWhere('nomor_register', 'ilike', "%{$search}%")
                  ->orWhere('pj_nama', 'ilike', "%{$search}%")
                  ->orWhere('keterangan', 'ilike', "%{$search}%");
            });
        }

        if ($kibType = $request->input('kib_type')) {
            $query->where('kib_type', $kibType);
        }

        if ($wilayahId = $request->input('wilayah_id')) {
            $query->where('wilayah_id', $wilayahId);
        }

        if ($pjNama = $request->input('pj_nama')) {
            $query->where('pj_nama', 'ilike', "%{$pjNama}%");
        }

        $assets = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Search/Index', [
            'assets' => $assets,
            'wilayahs' => Wilayah::orderBy('nama')->get(['id', 'nama']),
            'kibTypes' => Asset::KIB_LABELS,
            'filters' => [
                'search' => $search,
                'kib_type' => $kibType,
                'wilayah_id' => $wilayahId,
                'pj_nama' => $pjNama,
            ],
        ]);
    }

    public function map(Request $request)
    {
        $query = Asset::with('wilayah:id,nama')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'ilike', "%{$search}%")
                  ->orWhere('kode_barang', 'ilike', "%{$search}%")
                  ->orWhere('pj_nama', 'ilike', "%{$search}%");
            });
        }

        if ($kibType = $request->input('kib_type')) {
            $query->where('kib_type', $kibType);
        }

        if ($wilayahId = $request->input('wilayah_id')) {
            $query->where('wilayah_id', $wilayahId);
        }

        $assets = $query->select([
            'id', 'kib_type', 'nama_barang', 'kode_barang',
            'wilayah_id', 'pj_nama', 'harga', 'latitude', 'longitude',
        ])->limit(1000)->get();

        return Inertia::render('Search/Map', [
            'assets' => $assets,
            'wilayahs' => Wilayah::orderBy('nama')->get(['id', 'nama']),
            'kibTypes' => Asset::KIB_LABELS,
            'filters' => [
                'search' => $search,
                'kib_type' => $kibType,
                'wilayah_id' => $wilayahId,
            ],
        ]);
    }
}
