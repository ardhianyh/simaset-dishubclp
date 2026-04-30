<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Ruangan;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Per KIB type: count and total value
        $kibStats = Asset::select('kib_type')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('COALESCE(SUM(harga), 0) as total_value')
            ->groupBy('kib_type')
            ->get()
            ->keyBy('kib_type');

        $perKib = [];
        foreach (Asset::KIB_TYPES as $type) {
            $stat = $kibStats->get($type);
            $perKib[$type] = [
                'label' => Asset::KIB_LABELS[$type],
                'count' => $stat ? (int) $stat->count : 0,
                'total_value' => $stat ? (float) $stat->total_value : 0,
            ];
        }

        // Per ruangan: count and total value
        $ruanganStats = Asset::select('ruangan_id')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('COALESCE(SUM(harga), 0) as total_value')
            ->whereNotNull('ruangan_id')
            ->groupBy('ruangan_id')
            ->get()
            ->keyBy('ruangan_id');

        $ruangans = Ruangan::orderBy('nama')->get(['id', 'nama']);
        $perRuangan = $ruangans->map(function ($r) use ($ruanganStats) {
            $stat = $ruanganStats->get($r->id);

            return [
                'id' => $r->id,
                'nama' => $r->nama,
                'count' => $stat ? (int) $stat->count : 0,
                'total_value' => $stat ? (float) $stat->total_value : 0,
            ];
        })->values();

        // Grand totals
        $totalCount = collect($perKib)->sum('count');
        $totalValue = collect($perKib)->sum('total_value');

        // Assets with coordinates for map overview
        $mapAssets = Asset::with('ruangan:id,nama')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->select(['id', 'kib_type', 'nama_barang', 'kode_barang', 'ruangan_id', 'pj_nama', 'harga', 'latitude', 'longitude'])
            ->limit(500)
            ->get();

        return Inertia::render('Dashboard', [
            'perKib' => $perKib,
            'perRuangan' => $perRuangan,
            'totalCount' => $totalCount,
            'totalValue' => $totalValue,
            'mapAssets' => $mapAssets,
        ]);
    }
}
