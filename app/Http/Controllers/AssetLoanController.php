<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetLoan;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/**
 * Peminjaman barang sementara antar bidang/ruangan.
 *
 * Dicatat oleh pengurus barang pemilik barang (admin, atau staff yang memegang ruangan barang tersebut).
 * Barang tidak berpindah ruangan maupun PJ; staff ruangan peminjam cukup bisa melihat catatannya.
 */
class AssetLoanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $status = $request->input('status');
        $tahun = $request->input('tahun');
        $search = $request->input('search');

        $query = AssetLoan::terlihatOleh($user)
            ->with('asset:id,kib_type,nama_barang,kode_barang,nomor_register,ruangan_id');

        if ($status === 'dipinjam') {
            $query->aktif();
        } elseif ($status === 'kembali') {
            $query->whereNotNull('dikembalikan_pada');
        }

        if ($tahun) {
            $query->whereYear('dipinjam_pada', (int) $tahun);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('peminjam_nama', 'ilike', "%{$search}%")
                    ->orWhere('peminjam_ruangan_nama', 'ilike', "%{$search}%")
                    ->orWhere('keperluan', 'ilike', "%{$search}%")
                    ->orWhereHas('asset', fn ($a) => $a->where('nama_barang', 'ilike', "%{$search}%")
                        ->orWhere('kode_barang', 'ilike', "%{$search}%"));
            });
        }

        $ruanganKelolaan = $this->ruanganKelolaan($user);

        $loans = $query->orderByRaw('dikembalikan_pada is not null')
            ->orderByDesc('dipinjam_pada')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(function (AssetLoan $loan) use ($ruanganKelolaan) {
                $loan->setAttribute('can_manage', $ruanganKelolaan === null
                    || in_array((int) $loan->asset?->ruangan_id, $ruanganKelolaan, true));

                return $loan;
            });

        $daftarTahun = AssetLoan::terlihatOleh($user)
            ->pluck('dipinjam_pada')
            ->map(fn ($d) => $d->year)
            ->push((int) now()->year)
            ->unique()
            ->sortDesc()
            ->values();

        return Inertia::render('Peminjaman/Index', [
            'loans' => $loans,
            'jumlahDipinjam' => AssetLoan::terlihatOleh($user)->aktif()->count(),
            'daftarTahun' => $daftarTahun,
            'bisaMencatat' => $ruanganKelolaan === null || count($ruanganKelolaan) > 0,
            'filters' => [
                'status' => $status,
                'tahun' => $tahun,
                'search' => $search,
            ],
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        $assetId = $request->input('asset_id');
        $ruanganAsalId = $request->input('ruangan_asal_id');

        // Datang dari halaman detail aset: langsung pilih ruangan & barangnya.
        if ($assetId && ! $ruanganAsalId) {
            $ruanganAsalId = Asset::whereKey($assetId)->value('ruangan_id');
        }

        $ruanganKelolaan = $this->ruanganKelolaan($user);
        $ruangans = Ruangan::orderBy('nama')->get(['id', 'nama']);
        $ruanganAsalOptions = $ruanganKelolaan === null
            ? $ruangans
            : $ruangans->whereIn('id', $ruanganKelolaan)->values();

        $assets = [];
        if ($ruanganAsalId) {
            $sedangDipinjam = AssetLoan::aktif()->pluck('asset_id')->all();

            $assets = Asset::where('ruangan_id', $ruanganAsalId)
                ->orderBy('nama_barang')
                ->orderBy('kode_barang')
                ->get(['id', 'kib_type', 'nama_barang', 'kode_barang', 'nomor_register', 'pj_nama'])
                ->map(function (Asset $asset) use ($sedangDipinjam) {
                    $asset->setAttribute('sedang_dipinjam', in_array($asset->id, $sedangDipinjam, true));

                    return $asset;
                });
        }

        return Inertia::render('Peminjaman/Create', [
            'ruanganAsalOptions' => $ruanganAsalOptions,
            'ruangans' => $ruangans,
            'assets' => $assets,
            'ruanganAsalId' => $ruanganAsalId ? (int) $ruanganAsalId : null,
            'assetId' => $assetId ? (int) $assetId : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ruangan_asal_id' => ['required', 'exists:ruangans,id'],
            'asset_ids' => ['required', 'array', 'min:1'],
            'asset_ids.*' => ['integer', 'exists:assets,id'],
            'peminjam_nama' => ['required', 'string', 'max:255'],
            'peminjam_nip' => ['nullable', 'string', 'max:50'],
            'peminjam_ruangan_id' => ['required', 'exists:ruangans,id'],
            'keperluan' => ['required', 'string', 'max:2000'],
            'dipinjam_pada' => ['required', 'date'],
            'rencana_kembali' => ['nullable', 'date', 'after_or_equal:dipinjam_pada'],
        ], [
            'asset_ids.required' => 'Pilih minimal satu barang yang dipinjam.',
            'peminjam_ruangan_id.required' => 'Pilih bidang/ruangan peminjam.',
            'rencana_kembali.after_or_equal' => 'Rencana kembali tidak boleh sebelum waktu pinjam.',
        ]);

        $ruanganKelolaan = $this->ruanganKelolaan($request->user());
        if ($ruanganKelolaan !== null && ! in_array((int) $validated['ruangan_asal_id'], $ruanganKelolaan, true)) {
            abort(403, 'Anda hanya dapat mencatat peminjaman barang dari ruangan yang Anda kelola.');
        }

        $asal = Ruangan::findOrFail($validated['ruangan_asal_id']);
        $peminjamRuangan = Ruangan::findOrFail($validated['peminjam_ruangan_id']);

        $jumlah = DB::transaction(function () use ($validated, $asal, $peminjamRuangan) {
            $assets = Asset::whereIn('id', $validated['asset_ids'])
                ->lockForUpdate()
                ->get();

            if ($assets->count() !== count(array_unique($validated['asset_ids']))
                || $assets->contains(fn ($a) => (int) $a->ruangan_id !== $asal->id)) {
                abort(422, 'Ada barang yang dipilih tidak berada di ruangan asal.');
            }

            $masihDipinjam = AssetLoan::aktif()->whereIn('asset_id', $assets->pluck('id'))->exists();
            if ($masihDipinjam) {
                abort(422, 'Ada barang yang masih dipinjam dan belum dikembalikan.');
            }

            foreach ($assets as $asset) {
                AssetLoan::create([
                    'asset_id' => $asset->id,
                    'ruangan_asal_id' => $asal->id,
                    'ruangan_asal_nama' => $asal->nama,
                    'peminjam_nama' => $validated['peminjam_nama'],
                    'peminjam_nip' => $validated['peminjam_nip'] ?? null,
                    'peminjam_ruangan_id' => $peminjamRuangan->id,
                    'peminjam_ruangan_nama' => $peminjamRuangan->nama,
                    'keperluan' => $validated['keperluan'],
                    'dipinjam_pada' => $validated['dipinjam_pada'],
                    'rencana_kembali' => $validated['rencana_kembali'] ?? null,
                    'created_by' => auth()->id(),
                ]);
            }

            return $assets->count();
        });

        return redirect()->route('peminjaman.index')
            ->with('success', "{$jumlah} barang tercatat dipinjam oleh {$validated['peminjam_nama']} ({$peminjamRuangan->nama}).");
    }

    public function kembalikan(Request $request, AssetLoan $loan)
    {
        $ruanganKelolaan = $this->ruanganKelolaan($request->user());
        $ruanganBarang = (int) $loan->asset?->ruangan_id;
        if ($ruanganKelolaan !== null && ! in_array($ruanganBarang, $ruanganKelolaan, true)) {
            abort(403, 'Pengembalian dicatat oleh pengurus barang pemilik barang.');
        }

        if ($loan->dikembalikan_pada) {
            return back()->with('error', 'Barang ini sudah tercatat dikembalikan.');
        }

        $validated = $request->validate([
            'dikembalikan_pada' => ['required', 'date', 'after_or_equal:'.$loan->dipinjam_pada->format('Y-m-d H:i')],
            'catatan_kembali' => ['nullable', 'string', 'max:2000'],
        ], [
            'dikembalikan_pada.after_or_equal' => 'Waktu kembali tidak boleh sebelum waktu pinjam.',
        ]);

        $loan->update([
            'dikembalikan_pada' => $validated['dikembalikan_pada'],
            'catatan_kembali' => $validated['catatan_kembali'] ?? null,
            'returned_by' => auth()->id(),
        ]);

        return back()->with('success', ($loan->asset?->nama_barang ?? 'Barang').' tercatat sudah dikembalikan.');
    }

    /**
     * Ruangan yang barangnya boleh dicatat peminjamannya oleh user. Null berarti semua (admin).
     *
     * @return array<int, int>|null
     */
    private function ruanganKelolaan($user): ?array
    {
        if ($user->isAdmin()) {
            return null;
        }

        return $user->ruangans()->pluck('ruangans.id')->map(fn ($id) => (int) $id)->all();
    }
}
