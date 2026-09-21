<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GeneratesOfficialDocuments;
use App\Models\Asset;
use App\Models\AssetGeneratedDocument;
use App\Models\AssetMutationItem;
use App\Models\Ruangan;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExportController extends Controller
{
    use GeneratesOfficialDocuments;

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

    private const KIB_SUBTITLES = [
        'A' => 'TANAH',
        'B' => 'PERALATAN DAN MESIN',
        'C' => 'GEDUNG DAN BANGUNAN',
        'D' => 'JALAN, IRIGASI DAN JARINGAN',
        'E' => 'ASET TETAP LAINNYA',
        'L' => 'ASET LAINNYA',
    ];

    /**
     * Render tabel ratusan baris di DomPDF butuh memori jauh di atas default
     * php-fpm (128M) — rekap KIB B saja sudah ~300MB.
     */
    private function raisePdfLimits(): void
    {
        if (ini_get('memory_limit') !== '-1') {
            ini_set('memory_limit', '512M');
        }

        set_time_limit(300);
    }

    public function export(Request $request, string $kibSlug)
    {
        $kibType = strtoupper(str_replace('kib-', '', $kibSlug));

        $this->raisePdfLimits();

        if (! in_array($kibType, Asset::KIB_TYPES)) {
            abort(404);
        }

        $detailRelation = $this->getDetailRelation($kibType);

        $query = Asset::with(['ruangan:id,nama', $detailRelation])
            ->where('kib_type', $kibType);

        if ($ruanganId = $request->input('ruangan_id')) {
            $query->where('ruangan_id', $ruanganId);
        }

        $assets = $query->orderBy('kode_barang')->get();
        $totalHarga = $assets->sum('harga');

        $settings = $this->getSettings();
        $tanggal = now()->translatedFormat('d F Y');

        $viewName = 'exports.kib-'.strtolower($kibType);

        $pdf = Pdf::loadView($viewName, [
            'assets' => $assets,
            'totalHarga' => $totalHarga,
            'settings' => $settings,
            'kibLabel' => Asset::KIB_LABELS[$kibType],
            'kibType' => $kibType,
            'kibSubtitle' => self::KIB_SUBTITLES[$kibType],
            'tanggal' => $tanggal,
            'logoBase64' => $this->getLogoBase64(),
        ])->setPaper('a4', 'landscape');

        $filename = 'Rekapitulasi_'.str_replace(' ', '_', Asset::KIB_LABELS[$kibType]).'_'.date('Y-m-d').'.pdf';

        return $pdf->download($filename);
    }

    public function kirRuangan(Request $request, Ruangan $ruangan)
    {
        $this->raisePdfLimits();

        $user = auth()->user();
        if (! $user->isAdmin()) {
            $assigned = $user->ruangans()->pluck('ruangans.id');
            if (! $assigned->contains($ruangan->id)) {
                abort(403);
            }
        }

        // KIR menggambarkan posisi barang pada tanggal tertentu, bukan posisi terkini.
        $perTanggal = $request->input('per_tanggal')
            ? \Carbon\Carbon::parse($request->input('per_tanggal'))
            : now()->startOfYear();

        $assets = $this->assetsPadaTanggal($ruangan, $perTanggal);

        $totalHarga = $assets->sum('harga');
        $settings = $this->getSettings();

        // Nama bulan ditulis eksplisit supaya tidak ikut APP_LOCALE yang berbeda antar environment.
        $namaBulan = self::NAMA_BULAN[$perTanggal->month];
        $tanggal = $perTanggal->format('d')." {$namaBulan} ".$perTanggal->format('Y');
        $perTanggalLabel = $perTanggal->format('d')." -{$namaBulan}-".$perTanggal->format('Y');

        $pdf = Pdf::loadView('exports.kir-ruangan', [
            'ruangan' => $ruangan,
            'assets' => $assets,
            'totalHarga' => $totalHarga,
            'settings' => $settings,
            'tanggal' => $tanggal,
            'perTanggalLabel' => $perTanggalLabel,
            'logoBase64' => $this->getLogoBase64(),
            'kepalaNama' => $request->input('kepala_nama', $settings['ttd_kepala_nama']),
            'kepalaNip' => $request->input('kepala_nip', $settings['ttd_kepala_nip']),
            'pengurusNama' => $request->input('pengurus_nama', $settings['ttd_pengurus_nama']),
            'pengurusNip' => $request->input('pengurus_nip', $settings['ttd_pengurus_nip']),
            'pengurusRuanganNama' => $request->input('pengurus_ruangan_nama', ''),
            'pengurusRuanganNip' => $request->input('pengurus_ruangan_nip', ''),
            'pjRuanganNama' => $request->input('pj_ruangan_nama', ''),
            'pjRuanganNip' => $request->input('pj_ruangan_nip', ''),
        ])->setPaper('a4', 'landscape');

        $filename = 'KIR_'.str_replace(' ', '_', $ruangan->nama).'_'.$perTanggal->format('Y-m-d').'.pdf';

        return $pdf->download($filename);
    }

    /**
     * Daftar aset yang berada di sebuah ruangan pada tanggal tertentu.
     *
     * Posisi dihitung mundur dari riwayat pergeseran: kalau sebuah aset digeser
     * setelah tanggal tersebut, maka pada tanggal itu ia masih berada di ruangan
     * asal pergeseran pertama yang terjadi sesudahnya. Aset yang baru diperoleh
     * setelah tanggal tersebut tidak ikut tercetak.
     *
     * @return \Illuminate\Support\Collection<int, Asset>
     */
    private function assetsPadaTanggal(Ruangan $ruangan, \Carbon\Carbon $perTanggal): \Illuminate\Support\Collection
    {
        $posisiSaatItu = AssetMutationItem::query()
            ->join('asset_mutations', 'asset_mutations.id', '=', 'asset_mutation_items.mutation_id')
            ->whereDate('asset_mutations.tanggal', '>', $perTanggal)
            ->orderBy('asset_mutations.tanggal')
            ->orderBy('asset_mutation_items.id')
            ->get(['asset_mutation_items.asset_id', 'asset_mutation_items.ruangan_asal_id'])
            ->groupBy('asset_id')
            ->map(fn ($rows) => $rows->first()->ruangan_asal_id);

        $belumPernahPindah = Asset::where('ruangan_id', $ruangan->id)
            ->whereNotIn('id', $posisiSaatItu->keys()->all())
            ->pluck('id');

        $sudahPindahKeluar = $posisiSaatItu
            ->filter(fn ($ruanganId) => (int) $ruanganId === $ruangan->id)
            ->keys();

        $ids = $belumPernahPindah->map(fn ($id) => (int) $id)
            ->merge($sudahPindahKeluar->map(fn ($id) => (int) $id))
            ->unique();

        return Asset::with([
            'kibADetail', 'kibBDetail', 'kibCDetail',
            'kibDDetail', 'kibEDetail', 'kibLDetail',
        ])
            ->whereIn('id', $ids)
            ->orderBy('kode_barang')
            ->get()
            ->filter(function (Asset $asset) use ($perTanggal) {
                $tahun = $asset->tahunPerolehan();

                return $tahun === null || $tahun <= $perTanggal->year;
            })
            ->values();
    }

    public function paktaIntegritas(Request $request, Asset $asset)
    {
        if ($asset->kib_type !== 'B') {
            abort(404);
        }

        // Check if document already exists — serve it directly
        if ($request->input('download')) {
            $doc = AssetGeneratedDocument::where('asset_id', $asset->id)
                ->where('jenis', 'pakta_integritas')
                ->first();

            if ($doc && Storage::disk('local')->exists($doc->path)) {
                return response(Storage::disk('local')->get($doc->path), 200, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="'.$doc->filename.'"',
                ]);
            }

            abort(404);
        }

        $metadata = [
            'nama' => $request->input('nama', $asset->pj_nama),
            'nip' => $request->input('nip', $asset->pj_nip ?? ''),
            'jabatan' => $request->input('jabatan', ''),
            'tanggal' => $request->input('tanggal', now()->format('Y-m-d')),
        ];

        [$pdfContent, $filename] = $this->generatePaktaPdf($asset, $metadata, auth()->id());

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }

    /**
     * Render, persist, and upsert a Pakta Integritas PDF.
     *
     * @param  array{nama: string, nip: string, jabatan: string, tanggal: string}  $metadata
     * @return array{0: string, 1: string} [pdfContent, filename]
     */
    public function generatePaktaPdf(Asset $asset, array $metadata, ?int $generatedBy = null): array
    {
        $asset->loadMissing('kibBDetail');
        $detail = $asset->kibBDetail;

        $settings = $this->getSettings();

        $tanggalFormatted = \Carbon\Carbon::parse($metadata['tanggal'])->translatedFormat('d F Y');

        $spesifikasi = [
            'Merk/Type' => $detail?->merk_type ?? '-',
            'Jenis/model' => $asset->nama_barang,
            'Nomor Polisi' => $detail?->nomor_polisi ?? '-',
            'Tahun Pembuatan' => $detail?->tahun_pembelian ?? '-',
        ];

        $kabkota = $settings['instansi_kabkota'] ?: 'Cilacap';
        $kabupaten = str_ireplace(['pemerintah kabupaten ', 'pemerintah kota ', 'kabupaten ', 'kota '], '', $kabkota);

        $html = view('exports.pakta-integritas', [
            'asset' => $asset,
            'settings' => $settings,
            'nama' => $metadata['nama'],
            'nip' => $metadata['nip'],
            'jabatan' => $metadata['jabatan'],
            'tanggal' => $tanggalFormatted,
            'spesifikasi' => $spesifikasi,
            'kabupaten' => $kabupaten,
            'logoBase64' => $this->getLogoBase64(),
        ])->render();

        $mpdf = $this->makeMpdf();
        $mpdf->WriteHTML($html);

        $filename = 'Pakta_Integritas_'.str_replace(' ', '_', $asset->nama_barang).'.pdf';
        $pdfContent = $mpdf->Output($filename, 'S');

        $storagePath = 'generated-documents/'.$asset->id.'/pakta_integritas_'.time().'.pdf';
        Storage::disk('local')->put($storagePath, $pdfContent);

        AssetGeneratedDocument::updateOrCreate(
            ['asset_id' => $asset->id, 'jenis' => 'pakta_integritas'],
            [
                'path' => $storagePath,
                'filename' => $filename,
                'metadata' => $metadata,
                'generated_by' => $generatedBy,
            ]
        );

        return [$pdfContent, $filename];
    }

    public function bast(Request $request, Asset $asset)
    {
        if ($asset->kib_type !== 'B') {
            abort(404);
        }

        // Check if document already exists — serve it directly
        if ($request->input('download')) {
            $doc = AssetGeneratedDocument::where('asset_id', $asset->id)
                ->where('jenis', 'bast')
                ->first();

            if ($doc && Storage::disk('local')->exists($doc->path)) {
                return response(Storage::disk('local')->get($doc->path), 200, [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'inline; filename="'.$doc->filename.'"',
                ]);
            }

            abort(404);
        }

        $settings = $this->getSettings();

        $tanggalRaw = $request->input('tanggal', now()->format('Y-m-d'));
        $nomorInput = trim((string) $request->input('nomor_surat', ''));
        $nomorSurat = $nomorInput !== ''
            ? "000.3.2/{$nomorInput}/21/".\Carbon\Carbon::parse($tanggalRaw)->year
            : '';

        $metadata = [
            'nomor_surat' => $nomorSurat,
            'tanggal' => $tanggalRaw,
            'pihak1_nama' => $request->input('pihak1_nama', $settings['ttd_kepala_nama']),
            'pihak1_jabatan' => $request->input('pihak1_jabatan', 'Kepala '.($settings['instansi_unit'] ?: 'Dinas')),
            'pihak1_nip' => $request->input('pihak1_nip', $settings['ttd_kepala_nip']),
            'pihak1_peran' => trim((string) $request->input('pihak1_peran', 'Pengguna Barang')) ?: 'Pengguna Barang',
            'pihak2_nama' => $request->input('pihak2_nama', $asset->pj_nama),
            'pihak2_jabatan' => $request->input('pihak2_jabatan', ''),
            'pihak2_nip' => $request->input('pihak2_nip', $asset->pj_nip ?? ''),
        ];

        [$pdfContent, $filename] = $this->generateBastPdf($asset, $metadata, auth()->id());

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
        ]);
    }

    /**
     * Render, persist, and upsert a BAST PDF.
     *
     * @param  array{nomor_surat: string, tanggal: string, pihak1_nama: string, pihak1_jabatan: string, pihak1_nip: ?string, pihak1_peran: string, pihak2_nama: string, pihak2_jabatan: string, pihak2_nip: ?string}  $metadata
     * @return array{0: string, 1: string} [pdfContent, filename]
     */
    public function generateBastPdf(Asset $asset, array $metadata, ?int $generatedBy = null): array
    {
        $asset->loadMissing('kibBDetail');
        $detail = $asset->kibBDetail;

        $settings = $this->getSettings();

        $tanggalFormatted = \Carbon\Carbon::parse($metadata['tanggal'])->translatedFormat('d F Y');
        $tanggalTerbilang = $this->tanggalTerbilang($metadata['tanggal']);

        $rincianBarang = [
            'Nama Barang' => $asset->nama_barang,
            'Merk/Type' => $detail?->merk_type ?? '-',
            'No. Rangka' => $detail?->nomor_rangka ?? '-',
            'No. Polisi' => $detail?->nomor_polisi ?? '-',
            'Tahun Perolehan' => $detail?->tahun_pembelian ?? '-',
            'Harga Perolehan' => 'Rp '.number_format($asset->harga, 0, ',', '.').',-',
        ];

        $isKendaraan = ! empty($detail?->nomor_polisi) || ! empty($detail?->nomor_rangka) || ! empty($detail?->nomor_bpkb);
        $jenisBarang = $isKendaraan ? 'Kendaraan Dinas' : 'Alat Kantor';

        $kabkota = $settings['instansi_kabkota'] ?: 'Cilacap';
        $kabupaten = str_ireplace(['pemerintah kabupaten ', 'pemerintah kota ', 'kabupaten ', 'kota '], '', $kabkota);

        $html = view('exports.bast', [
            'asset' => $asset,
            'settings' => $settings,
            'nomorSurat' => $metadata['nomor_surat'],
            'tanggalFormatted' => $tanggalFormatted,
            'tanggalTerbilang' => $tanggalTerbilang,
            'pihak1Nama' => $metadata['pihak1_nama'],
            'pihak1Jabatan' => $metadata['pihak1_jabatan'],
            'pihak1Nip' => $metadata['pihak1_nip'],
            'pihak1Peran' => $metadata['pihak1_peran'] ?? 'Pengguna Barang',
            'pihak2Nama' => $metadata['pihak2_nama'],
            'pihak2Jabatan' => $metadata['pihak2_jabatan'],
            'pihak2Nip' => $metadata['pihak2_nip'],
            'rincianBarang' => $rincianBarang,
            'jenisBarang' => $jenisBarang,
            'kabupaten' => $kabupaten,
            'logoBase64' => $this->getLogoBase64(),
        ])->render();

        $mpdf = $this->makeMpdf();
        $mpdf->SetTopMargin(15);
        $mpdf->WriteHTML($html);

        $filename = 'BAST_'.str_replace(' ', '_', $asset->nama_barang).'.pdf';
        $pdfContent = $mpdf->Output($filename, 'S');

        $storagePath = 'generated-documents/'.$asset->id.'/bast_'.time().'.pdf';
        Storage::disk('local')->put($storagePath, $pdfContent);

        AssetGeneratedDocument::updateOrCreate(
            ['asset_id' => $asset->id, 'jenis' => 'bast'],
            [
                'path' => $storagePath,
                'filename' => $filename,
                'metadata' => $metadata,
                'generated_by' => $generatedBy,
            ]
        );

        return [$pdfContent, $filename];
    }
}
