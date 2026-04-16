<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetDisposal;
use App\Models\AssetDisposalDocument;
use App\Models\AssetGeneratedDocument;
use App\Models\Wilayah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AssetController extends Controller
{
    private function resolveKibType(string $kibSlug): string
    {
        $type = strtoupper(str_replace('kib-', '', $kibSlug));

        if (! in_array($type, Asset::KIB_TYPES)) {
            abort(404);
        }

        return $type;
    }

    private function getDetailRelation(string $kibType): string
    {
        return match ($kibType) {
            'A' => 'kibADetail',
            'B' => 'kibBDetail',
            'C' => 'kibCDetail',
            'D' => 'kibDDetail',
            'E' => 'kibEDetail',
            'L' => 'kibLDetail',
        };
    }

    private function getWilayahsForUser(): \Illuminate\Database\Eloquent\Collection
    {
        $user = auth()->user();

        if ($user->role === 'admin') {
            return Wilayah::orderBy('nama')->get(['id', 'nama']);
        }

        return $user->wilayahs()->orderBy('nama')->get(['wilayahs.id', 'nama']);
    }

    private function baseValidationRules(): array
    {
        return [
            'nama_barang' => ['required', 'string', 'max:500'],
            'kode_barang' => ['required', 'string', 'max:50'],
            'nomor_register' => ['required', 'string', 'max:50'],
            'wilayah_id' => ['nullable', 'exists:wilayahs,id'],
            'pj_nama' => ['required', 'string', 'max:255'],
            'pj_nip' => ['nullable', 'string', 'max:50'],
            'pj_telepon' => ['nullable', 'string', 'max:20'],
            'pj_alamat' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'asal_usul' => ['required', 'in:' . implode(',', Asset::ASAL_USUL_OPTIONS)],
            'harga' => ['required', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
        ];
    }

    private function detailValidationRules(string $kibType): array
    {
        return match ($kibType) {
            'A' => [
                'detail.luas_m2' => ['required', 'numeric', 'min:0'],
                'detail.tahun_pengadaan' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
                'detail.alamat' => ['required', 'string', 'max:2000'],
                'detail.hak_tanah' => ['nullable', 'string', 'max:100'],
                'detail.sertifikat_tanggal' => ['nullable', 'date'],
                'detail.sertifikat_nomor' => ['nullable', 'string', 'max:100'],
                'detail.penggunaan' => ['nullable', 'string', 'max:255'],
            ],
            'B' => [
                'detail.merk_type' => ['nullable', 'string', 'max:255'],
                'detail.ukuran_cc' => ['nullable', 'string', 'max:100'],
                'detail.bahan' => ['nullable', 'string', 'max:100'],
                'detail.tahun_pembelian' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
                'detail.nomor_pabrik' => ['nullable', 'string', 'max:100'],
                'detail.nomor_rangka' => ['nullable', 'string', 'max:100'],
                'detail.nomor_mesin' => ['nullable', 'string', 'max:100'],
                'detail.nomor_polisi' => ['nullable', 'string', 'max:20'],
                'detail.nomor_bpkb' => ['nullable', 'string', 'max:100'],
            ],
            'C' => [
                'detail.kondisi' => ['required', 'in:Baik,Kurang Baik,Rusak Berat'],
                'detail.bertingkat' => ['required', 'boolean'],
                'detail.beton' => ['required', 'boolean'],
                'detail.luas_lantai_m2' => ['nullable', 'numeric', 'min:0'],
                'detail.alamat' => ['required', 'string', 'max:2000'],
                'detail.dokumen_tanggal' => ['nullable', 'date'],
                'detail.dokumen_nomor' => ['nullable', 'string', 'max:255'],
                'detail.status_tanah' => ['nullable', 'string', 'max:100'],
                'detail.nomor_kode_tanah' => ['nullable', 'string', 'max:100'],
            ],
            'D' => [
                'detail.konstruksi' => ['nullable', 'string', 'max:255'],
                'detail.panjang_km' => ['nullable', 'numeric', 'min:0'],
                'detail.lebar_m' => ['nullable', 'numeric', 'min:0'],
                'detail.luas_m2' => ['nullable', 'numeric', 'min:0'],
                'detail.alamat' => ['required', 'string', 'max:2000'],
                'detail.dokumen_tanggal' => ['nullable', 'date'],
                'detail.dokumen_nomor' => ['nullable', 'string', 'max:255'],
                'detail.status_tanah' => ['nullable', 'string', 'max:100'],
                'detail.nomor_kode_tanah' => ['nullable', 'string', 'max:100'],
                'detail.kondisi' => ['nullable', 'in:Baik,Kurang Baik,Rusak Berat'],
            ],
            'E' => [
                'detail.judul_pencipta' => ['nullable', 'string', 'max:255'],
                'detail.spesifikasi' => ['nullable', 'string', 'max:2000'],
                'detail.asal_daerah' => ['nullable', 'string', 'max:255'],
                'detail.pencipta' => ['nullable', 'string', 'max:255'],
                'detail.bahan' => ['nullable', 'string', 'max:255'],
                'detail.jenis' => ['nullable', 'string', 'max:255'],
                'detail.ukuran' => ['nullable', 'string', 'max:255'],
                'detail.jumlah' => ['required', 'integer', 'min:1'],
                'detail.tahun_cetak' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            ],
            'L' => [
                'detail.tahun_pengadaan' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
                'detail.judul_nama' => ['nullable', 'string', 'max:500'],
                'detail.pencipta' => ['nullable', 'string', 'max:255'],
                'detail.spesifikasi' => ['nullable', 'string', 'max:2000'],
                'detail.kondisi' => ['nullable', 'string', 'max:100'],
            ],
        };
    }

    public function index(Request $request, string $kibSlug)
    {
        $kibType = $this->resolveKibType($kibSlug);
        $detailRelation = $this->getDetailRelation($kibType);

        $query = Asset::with(['wilayah:id,nama', $detailRelation])
            ->where('kib_type', $kibType);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_barang', 'ilike', "%{$search}%")
                  ->orWhere('kode_barang', 'ilike', "%{$search}%")
                  ->orWhere('nomor_register', 'ilike', "%{$search}%")
                  ->orWhere('pj_nama', 'ilike', "%{$search}%");
            });
        }

        if ($wilayahId = $request->input('wilayah_id')) {
            $query->where('wilayah_id', $wilayahId);
        }

        $assets = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Assets/Index', [
            'assets' => $assets,
            'kibType' => $kibType,
            'kibLabel' => Asset::KIB_LABELS[$kibType],
            'wilayahs' => Wilayah::orderBy('nama')->get(['id', 'nama']),
            'filters' => [
                'search' => $search,
                'wilayah_id' => $wilayahId,
            ],
        ]);
    }

    public function show(string $kibSlug, Asset $asset)
    {
        $kibType = $this->resolveKibType($kibSlug);

        if ($asset->kib_type !== $kibType) {
            abort(404);
        }

        $detailRelation = $this->getDetailRelation($kibType);
        $asset->load(['wilayah:id,nama', $detailRelation, 'documents', 'creator:id,name', 'updater:id,name']);

        $generatedDocuments = AssetGeneratedDocument::where('asset_id', $asset->id)
            ->get()
            ->keyBy('jenis');

        return Inertia::render('Assets/Show', [
            'asset' => $asset,
            'kibType' => $kibType,
            'kibLabel' => Asset::KIB_LABELS[$kibType],
            'jenisOptions' => \App\Models\AssetDocument::JENIS_OPTIONS,
            'generatedDocuments' => $generatedDocuments,
        ]);
    }

    public function create(string $kibSlug)
    {
        $kibType = $this->resolveKibType($kibSlug);

        return Inertia::render('Assets/Create', [
            'kibType' => $kibType,
            'kibLabel' => Asset::KIB_LABELS[$kibType],
            'wilayahs' => $this->getWilayahsForUser(),
            'asalUsulOptions' => Asset::ASAL_USUL_OPTIONS,
        ]);
    }

    public function store(Request $request, string $kibSlug)
    {
        $kibType = $this->resolveKibType($kibSlug);

        $rules = array_merge($this->baseValidationRules(), $this->detailValidationRules($kibType));
        $validated = $request->validate($rules);

        // Staff can only assign to their own wilayahs
        $user = auth()->user();
        if ($user->role === 'staff' && ! empty($validated['wilayah_id'])) {
            $allowedIds = $user->wilayahs()->pluck('wilayahs.id')->toArray();
            if (! in_array($validated['wilayah_id'], $allowedIds)) {
                abort(403, 'Anda tidak memiliki akses ke wilayah ini.');
            }
        }

        DB::transaction(function () use ($validated, $kibType, $user) {
            $asset = Asset::create([
                ...$this->extractBaseData($validated),
                'kib_type' => $kibType,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            $detailModel = Asset::DETAIL_MODELS[$kibType];
            $detailModel::create([
                'asset_id' => $asset->id,
                ...$validated['detail'],
            ]);
        });

        return redirect()->route('assets.index', $kibSlug)
            ->with('success', 'Aset berhasil ditambahkan.');
    }

    public function edit(string $kibSlug, Asset $asset)
    {
        $kibType = $this->resolveKibType($kibSlug);

        if ($asset->kib_type !== $kibType) {
            abort(404);
        }

        $detailRelation = $this->getDetailRelation($kibType);
        $asset->load(['wilayah:id,nama', $detailRelation]);

        return Inertia::render('Assets/Edit', [
            'asset' => $asset,
            'kibType' => $kibType,
            'kibLabel' => Asset::KIB_LABELS[$kibType],
            'wilayahs' => $this->getWilayahsForUser(),
            'asalUsulOptions' => Asset::ASAL_USUL_OPTIONS,
        ]);
    }

    public function update(Request $request, string $kibSlug, Asset $asset)
    {
        $kibType = $this->resolveKibType($kibSlug);

        if ($asset->kib_type !== $kibType) {
            abort(404);
        }

        $rules = array_merge($this->baseValidationRules(), $this->detailValidationRules($kibType));
        $validated = $request->validate($rules);

        $user = auth()->user();
        if ($user->role === 'staff' && ! empty($validated['wilayah_id'])) {
            $allowedIds = $user->wilayahs()->pluck('wilayahs.id')->toArray();
            if (! in_array($validated['wilayah_id'], $allowedIds)) {
                abort(403, 'Anda tidak memiliki akses ke wilayah ini.');
            }
        }

        DB::transaction(function () use ($asset, $validated, $kibType, $user) {
            $asset->update([
                ...$this->extractBaseData($validated),
                'updated_by' => $user->id,
            ]);

            $detailRelation = $this->getDetailRelation($kibType);
            $detail = $asset->{$detailRelation};

            if ($detail) {
                $detail->update($validated['detail']);
            } else {
                $detailModel = Asset::DETAIL_MODELS[$kibType];
                $detailModel::create([
                    'asset_id' => $asset->id,
                    ...$validated['detail'],
                ]);
            }
        });

        return redirect()->route('assets.index', $kibSlug)
            ->with('success', 'Aset berhasil diperbarui.');
    }

    public function destroy(Request $request, string $kibSlug, Asset $asset)
    {
        $kibType = $this->resolveKibType($kibSlug);

        if ($asset->kib_type !== $kibType) {
            abort(404);
        }

        $validated = $request->validate([
            'jenis' => ['required', 'in:' . implode(',', AssetDisposal::JENIS_OPTIONS)],
            'alasan' => ['nullable', 'string', 'max:2000'],
            'nomor_sk' => ['nullable', 'string', 'max:255'],
            'tanggal' => ['required', 'date'],
            'dokumen' => ['required', 'array', 'min:1'],
            'dokumen.*.file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx'],
            'dokumen.*.jenis_dokumen' => ['required', 'string', 'max:100'],
        ]);

        DB::transaction(function () use ($asset, $validated) {
            $disposal = AssetDisposal::create([
                'asset_id' => $asset->id,
                'jenis' => $validated['jenis'],
                'alasan' => $validated['alasan'] ?? null,
                'nomor_sk' => $validated['nomor_sk'] ?? null,
                'tanggal' => $validated['tanggal'],
                'disposed_by' => auth()->id(),
            ]);

            foreach ($validated['dokumen'] as $doc) {
                $file = $doc['file'];
                $namaFile = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs("disposal-documents/{$disposal->id}", $namaFile, 'local');

                AssetDisposalDocument::create([
                    'disposal_id' => $disposal->id,
                    'jenis_dokumen' => $doc['jenis_dokumen'],
                    'nama_asli' => $file->getClientOriginalName(),
                    'nama_file' => $namaFile,
                    'path' => $path,
                    'ukuran_bytes' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'uploaded_by' => auth()->id(),
                ]);
            }

            $asset->update(['updated_by' => auth()->id()]);
            $asset->delete();
        });

        return redirect()->route('assets.index', $kibSlug)
            ->with('success', 'Aset berhasil dihapus dengan pencatatan penghapusan.');
    }

    public function qrLabel(string $kibSlug, Asset $asset)
    {
        $kibType = $this->resolveKibType($kibSlug);

        if ($asset->kib_type !== $kibType) {
            abort(404);
        }

        $asset->load('wilayah:id,nama');

        return Inertia::render('Assets/QrLabel', [
            'asset' => $asset,
            'kibType' => $kibType,
            'kibLabel' => Asset::KIB_LABELS[$kibType],
            'publicUrl' => route('public.asset.show', $asset),
        ]);
    }

    private function extractBaseData(array $validated): array
    {
        return collect($validated)->except('detail')->toArray();
    }
}
