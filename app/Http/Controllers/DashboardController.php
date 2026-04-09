<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Wilayah;
use Illuminate\Support\Facades\DB;
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

        // Per wilayah: count and total value
        $wilayahStats = Asset::select('wilayah_id')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('COALESCE(SUM(harga), 0) as total_value')
            ->whereNotNull('wilayah_id')
            ->groupBy('wilayah_id')
            ->get()
            ->keyBy('wilayah_id');

        $wilayahs = Wilayah::orderBy('nama')->get(['id', 'nama']);
        $perWilayah = $wilayahs->map(function ($w) use ($wilayahStats) {
            $stat = $wilayahStats->get($w->id);
            return [
                'id' => $w->id,
                'nama' => $w->nama,
                'count' => $stat ? (int) $stat->count : 0,
                'total_value' => $stat ? (float) $stat->total_value : 0,
            ];
        })->values();

        // Grand totals
        $totalCount = collect($perKib)->sum('count');
        $totalValue = collect($perKib)->sum('total_value');

        // Assets with coordinates for map overview
        $mapAssets = Asset::with('wilayah:id,nama')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->select(['id', 'kib_type', 'nama_barang', 'kode_barang', 'wilayah_id', 'pj_nama', 'harga', 'latitude', 'longitude'])
            ->limit(500)
            ->get();

        return Inertia::render('Dashboard', [
            'perKib' => $perKib,
            'perWilayah' => $perWilayah,
            'totalCount' => $totalCount,
            'totalValue' => $totalValue,
            'mapAssets' => $mapAssets,
        ]);
    }
}
