<?php

namespace App\Http\Controllers;

use App\Models\Pejabat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PejabatController extends Controller
{
    public function index(Request $request)
    {
        $query = Pejabat::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'ilike', "%{$search}%")
                    ->orWhere('nip', 'ilike', "%{$search}%")
                    ->orWhere('jabatan', 'ilike', "%{$search}%");
            });
        }

        $pejabats = $query->orderBy('nama')->paginate(10)->withQueryString();

        return Inertia::render('Pejabats/Index', [
            'pejabats' => $pejabats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Pejabats/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30'],
            'jabatan' => ['nullable', 'string', 'max:255'],
        ]);

        Pejabat::create($validated);

        return redirect()->route('pejabats.index')->with('success', 'Data pejabat berhasil ditambahkan.');
    }

    public function edit(Pejabat $pejabat)
    {
        return Inertia::render('Pejabats/Edit', [
            'pejabat' => $pejabat,
        ]);
    }

    public function update(Request $request, Pejabat $pejabat)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30'],
            'jabatan' => ['nullable', 'string', 'max:255'],
        ]);

        $pejabat->update($validated);

        return redirect()->route('pejabats.index')->with('success', 'Data pejabat berhasil diperbarui.');
    }

    public function destroy(Pejabat $pejabat)
    {
        $pejabat->delete();

        return redirect()->route('pejabats.index')->with('success', 'Data pejabat berhasil dihapus.');
    }

    /**
     * Pencarian penanggung jawab untuk isian nama + NIP.
     *
     * Sumbernya master pejabat digabung dengan nama PJ yang sudah pernah
     * dipakai pada data aset dan ruangan, supaya nama yang sudah ada di
     * sistem langsung bisa dipilih tanpa harus didaftarkan lebih dulu.
     */
    public function searchPenanggungJawab(Request $request)
    {
        $search = trim((string) $request->input('q', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $hasil = collect();

        foreach (Pejabat::where('nama', 'ilike', "%{$search}%")
            ->orWhere('nip', 'ilike', "%{$search}%")
            ->orderBy('nama')->limit(10)->get(['nama', 'nip', 'jabatan']) as $pejabat) {
            $hasil->push([
                'nama' => $pejabat->nama,
                'nip' => $pejabat->nip,
                'jabatan' => $pejabat->jabatan,
                'prioritas' => 3,
            ]);
        }

        foreach (\App\Models\Ruangan::where('pj_nama', 'ilike', "%{$search}%")
            ->orderBy('pj_nama')->limit(10)->get(['pj_nama', 'pj_nip', 'nama']) as $ruangan) {
            $hasil->push([
                'nama' => $ruangan->pj_nama,
                'nip' => $ruangan->pj_nip,
                'jabatan' => 'Penanggung Jawab '.$ruangan->nama,
                'prioritas' => 2,
            ]);
        }

        foreach (\App\Models\Asset::where('pj_nama', 'ilike', "%{$search}%")
            ->select('pj_nama', 'pj_nip')->distinct()
            ->orderBy('pj_nama')->limit(20)->get() as $asset) {
            $hasil->push([
                'nama' => $asset->pj_nama,
                'nip' => $asset->pj_nip,
                'jabatan' => null,
                'prioritas' => 1,
            ]);
        }

        // Satu orang sering tertulis beberapa versi (singkatan, beda gelar, NIP
        // pakai spasi atau tidak). Digabung per NIP supaya usulannya satu baris:
        // nama diambil dari sumber paling resmi/terlengkap, NIP diambil yang
        // berformat spasi karena itu yang dipakai saat dicetak.
        $unik = $hasil
            ->filter(fn ($item) => filled($item['nama']))
            ->groupBy(function ($item) {
                $nipAngka = preg_replace('/\D/', '', (string) $item['nip']);

                return $nipAngka !== ''
                    ? 'nip:'.$nipAngka
                    : 'nama:'.mb_strtolower(preg_replace('/\s+/', ' ', trim($item['nama'])));
            })
            ->map(function ($grup) {
                $terpilih = $grup
                    ->sortByDesc(fn ($item) => [$item['prioritas'], mb_strlen($item['nama'])])
                    ->first();

                $nip = $grup->pluck('nip')->filter()
                    ->sortByDesc(fn ($n) => str_contains($n, ' ') ? 1 : 0)
                    ->first();

                return [
                    'nama' => $terpilih['nama'],
                    'nip' => $nip,
                    'jabatan' => $grup->pluck('jabatan')->filter()->first(),
                ];
            })
            ->sortBy('nama')
            ->values()
            ->take(10);

        return response()->json($unik);
    }

    public function search(Request $request)
    {
        $search = $request->input('q', '');

        $pejabats = Pejabat::query()
            ->where(function ($q) use ($search) {
                $q->where('nama', 'ilike', "%{$search}%")
                    ->orWhere('nip', 'ilike', "%{$search}%")
                    ->orWhere('jabatan', 'ilike', "%{$search}%");
            })
            ->orderBy('nama')
            ->limit(10)
            ->get(['id', 'nama', 'nip', 'jabatan']);

        return response()->json($pejabats);
    }
}
