<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GeneratesOfficialDocuments;
use App\Models\Asset;
use App\Models\AssetMutation;
use App\Models\AssetMutationDocument;
use App\Models\AssetMutationItem;
use App\Models\Ruangan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AssetMutationController extends Controller
{
    use GeneratesOfficialDocuments;

    public function index(Request $request)
    {
        $query = AssetMutation::withCount('items');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_bast', 'ilike', "%{$search}%")
                    ->orWhere('ruangan_asal_nama', 'ilike', "%{$search}%")
                    ->orWhere('ruangan_tujuan_nama', 'ilike', "%{$search}%");
            });
        }

        $mutations = $query->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Mutasi/Index', [
            'mutations' => $mutations,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(Request $request)
    {
        $ruanganAsalId = $request->input('ruangan_asal_id');

        $assets = [];
        if ($ruanganAsalId) {
            $assets = Asset::where('ruangan_id', $ruanganAsalId)
                ->orderBy('kode_barang')
                ->get(['id', 'kib_type', 'nama_barang', 'kode_barang', 'nomor_register', 'pj_nama']);
        }

        return Inertia::render('Mutasi/Create', [
            'ruangans' => Ruangan::orderBy('nama')->get(['id', 'nama', 'pj_nama', 'pj_nip']),
            'assets' => $assets,
            'ruanganAsalId' => $ruanganAsalId ? (int) $ruanganAsalId : null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateMutation($request, requireDocument: true);

        $asal = Ruangan::findOrFail($validated['ruangan_asal_id']);
        $tujuan = Ruangan::findOrFail($validated['ruangan_tujuan_id']);
        $assets = $this->resolveAssets($validated['asset_ids'], $asal->id);

        $mutation = DB::transaction(function () use ($validated, $asal, $tujuan, $assets, $request) {
            $mutation = AssetMutation::create([
                'nomor_bast' => $validated['nomor_bast'],
                'tanggal' => $validated['tanggal'],
                'jenis' => $this->jenis($asal, $tujuan),
                'ruangan_asal_id' => $asal->id,
                'ruangan_asal_nama' => $asal->nama,
                'ruangan_tujuan_id' => $tujuan->id,
                'ruangan_tujuan_nama' => $tujuan->nama,
                'pj_asal_nama' => $validated['pj_asal_nama'] ?? $asal->pj_nama,
                'pj_asal_nip' => $validated['pj_asal_nip'] ?? $asal->pj_nip,
                'pj_tujuan_nama' => $validated['pj_tujuan_nama'] ?? $tujuan->pj_nama,
                'pj_tujuan_nip' => $validated['pj_tujuan_nip'] ?? $tujuan->pj_nip,
                'keterangan' => $validated['keterangan'] ?? null,
                'created_by' => auth()->id(),
            ]);

            foreach ($assets as $asset) {
                AssetMutationItem::create([
                    'mutation_id' => $mutation->id,
                    'asset_id' => $asset->id,
                    'ruangan_asal_id' => $asset->ruangan_id,
                    'ruangan_asal_nama' => $asal->nama,
                    'pj_asal_nama' => $asset->pj_nama,
                    'pj_asal_nip' => $asset->pj_nip,
                ]);

                $asset->update([
                    'ruangan_id' => $tujuan->id,
                    'pj_nama' => $mutation->pj_tujuan_nama ?: $asset->pj_nama,
                    'pj_nip' => $mutation->pj_tujuan_nip,
                    'updated_by' => auth()->id(),
                ]);
            }

            $this->storeDocuments($mutation, $request);

            return $mutation;
        });

        $pesan = $mutation->jenis === AssetMutation::JENIS_GANTI_PJ
            ? $assets->count().' barang kini menjadi tanggung jawab '.$mutation->pj_tujuan_nama.'.'
            : $assets->count().' barang berhasil digeser ke '.$tujuan->nama.'.';

        return redirect()->route('mutasi.show', $mutation)->with('success', $pesan);
    }

    public function show(AssetMutation $mutation)
    {
        $mutation->load([
            'items.asset:id,kib_type,nama_barang,kode_barang,nomor_register',
            'documents',
            'creator:id,name',
        ]);

        return Inertia::render('Mutasi/Show', [
            'mutation' => $mutation,
        ]);
    }

    public function document(AssetMutation $mutation, AssetMutationDocument $document)
    {
        if ($document->mutation_id !== $mutation->id) {
            abort(404);
        }

        if (! Storage::disk('local')->exists($document->path)) {
            abort(404);
        }

        return response(Storage::disk('local')->get($document->path), 200, [
            'Content-Type' => $document->mime_type ?: 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="'.$document->nama_asli.'"',
        ]);
    }

    /**
     * Draft BAST dari isian form yang belum disimpan, untuk ditandatangani lebih dulu.
     */
    public function draftBast(Request $request)
    {
        $validated = $this->validateMutation($request, requireDocument: false);

        $asal = Ruangan::findOrFail($validated['ruangan_asal_id']);
        $tujuan = Ruangan::findOrFail($validated['ruangan_tujuan_id']);
        $assets = $this->resolveAssets($validated['asset_ids'], $asal->id);

        [$pdf, $filename] = $this->renderBastMutasi([
            'jenis' => $this->jenis($asal, $tujuan),
            'nomor_bast' => $validated['nomor_bast'],
            'tanggal' => $validated['tanggal'],
            'ruangan_asal_nama' => $asal->nama,
            'ruangan_tujuan_nama' => $tujuan->nama,
            'pj_asal_nama' => $validated['pj_asal_nama'] ?? $asal->pj_nama,
            'pj_asal_nip' => $validated['pj_asal_nip'] ?? $asal->pj_nip,
            'pj_tujuan_nama' => $validated['pj_tujuan_nama'] ?? $tujuan->pj_nama,
            'pj_tujuan_nip' => $validated['pj_tujuan_nip'] ?? $tujuan->pj_nip,
            'keterangan' => $validated['keterangan'] ?? null,
        ], $assets);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }

    /**
     * BAST dari mutasi yang sudah tersimpan.
     */
    public function bast(AssetMutation $mutation)
    {
        $assets = Asset::withoutGlobalScopes()
            ->whereIn('id', $mutation->items()->pluck('asset_id'))
            ->orderBy('kode_barang')
            ->get();

        [$pdf, $filename] = $this->renderBastMutasi([
            'jenis' => $mutation->jenis,
            'nomor_bast' => $mutation->nomor_bast,
            'tanggal' => $mutation->tanggal->format('Y-m-d'),
            'ruangan_asal_nama' => $mutation->ruangan_asal_nama,
            'ruangan_tujuan_nama' => $mutation->ruangan_tujuan_nama,
            'pj_asal_nama' => $mutation->pj_asal_nama,
            'pj_asal_nip' => $mutation->pj_asal_nip,
            'pj_tujuan_nama' => $mutation->pj_tujuan_nama,
            'pj_tujuan_nip' => $mutation->pj_tujuan_nip,
            'keterangan' => $mutation->keterangan,
        ], $assets);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }

    private function validateMutation(Request $request, bool $requireDocument): array
    {
        $rules = [
            'nomor_bast' => ['required', 'string', 'max:255'],
            'tanggal' => ['required', 'date'],
            'ruangan_asal_id' => ['required', 'exists:ruangans,id'],
            // Ruangan tujuan boleh sama dengan asal: itu berarti hanya ganti penanggung jawab.
            'ruangan_tujuan_id' => ['required', 'exists:ruangans,id'],
            'asset_ids' => ['required', 'array', 'min:1'],
            'asset_ids.*' => ['integer', 'exists:assets,id'],
            'pj_asal_nama' => ['nullable', 'string', 'max:255'],
            'pj_asal_nip' => ['nullable', 'string', 'max:50'],
            'pj_tujuan_nama' => ['nullable', 'required_if_accepted:ganti_pj', 'string', 'max:255'],
            'pj_tujuan_nip' => ['nullable', 'string', 'max:50'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
        ];

        $request->merge(['ganti_pj' => $request->input('ruangan_asal_id') == $request->input('ruangan_tujuan_id')]);

        if ($requireDocument) {
            $rules['dokumen'] = ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png'];
        }

        return $request->validate($rules, [
            'pj_tujuan_nama.required_if_accepted' => 'Isi penanggung jawab baru untuk barang yang ganti penanggung jawab.',
            'asset_ids.required' => 'Pilih minimal satu barang yang akan digeser.',
            'dokumen.required' => 'Dokumen BAST wajib diunggah sebelum barang dapat digeser.',
        ]);
    }

    private function jenis(Ruangan $asal, Ruangan $tujuan): string
    {
        return $asal->id === $tujuan->id
            ? AssetMutation::JENIS_GANTI_PJ
            : AssetMutation::JENIS_PINDAH_RUANGAN;
    }

    /**
     * Pastikan semua barang yang dipilih memang berada di ruangan asal.
     */
    private function resolveAssets(array $assetIds, int $ruanganAsalId)
    {
        $assets = Asset::whereIn('id', $assetIds)
            ->orderBy('kode_barang')
            ->get();

        $luar = $assets->firstWhere('ruangan_id', '!=', $ruanganAsalId);
        if ($assets->count() !== count(array_unique($assetIds)) || $luar) {
            abort(422, 'Ada barang yang dipilih tidak berada di ruangan asal.');
        }

        return $assets;
    }

    private function storeDocuments(AssetMutation $mutation, Request $request): void
    {
        $file = $request->file('dokumen');
        $namaFile = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs("mutation-documents/{$mutation->id}", $namaFile, 'local');

        AssetMutationDocument::create([
            'mutation_id' => $mutation->id,
            'jenis_dokumen' => 'BAST',
            'nama_asli' => $file->getClientOriginalName(),
            'nama_file' => $namaFile,
            'path' => $path,
            'ukuran_bytes' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => auth()->id(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  \Illuminate\Support\Collection<int, Asset>  $assets
     * @return array{0: string, 1: string}
     */
    private function renderBastMutasi(array $data, $assets): array
    {
        $settings = $this->getSettings();

        $assets->loadMissing(['kibADetail', 'kibBDetail', 'kibCDetail', 'kibDDetail', 'kibEDetail', 'kibLDetail']);

        $barang = $assets->map(function (Asset $asset) {
            return [
                'nama_barang' => $asset->nama_barang,
                'kode_barang' => $asset->kode_barang,
                'nomor_register' => $asset->nomor_register,
                'merk' => $this->merkAset($asset),
                'tahun' => $asset->tahunPerolehan(),
                'harga' => $asset->harga,
            ];
        })->values();

        $kabkota = $settings['instansi_kabkota'] ?: 'Cilacap';
        $kabupaten = str_ireplace(['pemerintah kabupaten ', 'pemerintah kota ', 'kabupaten ', 'kota '], '', $kabkota);

        $html = view('exports.bast-mutasi', [
            'gantiPj' => $data['jenis'] === AssetMutation::JENIS_GANTI_PJ,
            'settings' => $settings,
            'nomorSurat' => $data['nomor_bast'],
            'tanggalFormatted' => \Carbon\Carbon::parse($data['tanggal'])->translatedFormat('d F Y'),
            'tanggalTerbilang' => $this->tanggalTerbilang($data['tanggal']),
            'ruanganAsal' => $data['ruangan_asal_nama'],
            'ruanganTujuan' => $data['ruangan_tujuan_nama'],
            'pihak1Nama' => $data['pj_asal_nama'] ?: '-',
            'pihak1Nip' => $data['pj_asal_nip'],
            'pihak2Nama' => $data['pj_tujuan_nama'] ?: '-',
            'pihak2Nip' => $data['pj_tujuan_nip'],
            'keterangan' => $data['keterangan'] ?? null,
            'barang' => $barang,
            'kabupaten' => $kabupaten,
            'logoBase64' => $this->getLogoBase64(),
        ])->render();

        $mpdf = $this->makeMpdf();
        $mpdf->SetTopMargin(15);
        $mpdf->WriteHTML($html);

        $filename = $data['jenis'] === AssetMutation::JENIS_GANTI_PJ
            ? 'BAST_Ganti_PJ_'.Str::slug($data['ruangan_asal_nama']).'.pdf'
            : 'BAST_Pergeseran_'.Str::slug($data['ruangan_asal_nama']).'_ke_'.Str::slug($data['ruangan_tujuan_nama']).'.pdf';

        return [$mpdf->Output($filename, 'S'), $filename];
    }

    private function merkAset(Asset $asset): ?string
    {
        return match ($asset->kib_type) {
            'B' => $asset->kibBDetail?->merk_type,
            'D' => $asset->kibDDetail?->konstruksi,
            'E' => $asset->kibEDetail?->judul_pencipta,
            'L' => $asset->kibLDetail?->judul_nama,
            default => null,
        };
    }
}
