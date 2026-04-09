<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Mpdf\Mpdf;

class ExportController extends Controller
{
    private function getLogoBase64(): ?string
    {
        $logoPath = public_path('logo.png');
        if (file_exists($logoPath)) {
            $data = base64_encode(file_get_contents($logoPath));
            $mime = mime_content_type($logoPath);
            return "data:{$mime};base64,{$data}";
        }
        return null;
    }

    private function getSettings(): array
    {
        $keys = [
            'instansi_nama', 'instansi_provinsi', 'instansi_kabkota',
            'instansi_bidang', 'instansi_unit', 'instansi_sub_unit',
            'instansi_kode_lokasi', 'instansi_alamat', 'instansi_telepon',
            'instansi_fax', 'instansi_website', 'instansi_email',
            'ttd_kepala_nama', 'ttd_kepala_nip',
            'ttd_pengurus_nama', 'ttd_pengurus_nip', 'ttd_kota',
        ];

        $settings = [];
        foreach ($keys as $key) {
            $settings[$key] = Setting::get($key, '');
        }

        return $settings;
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

    private const KIB_SUBTITLES = [
        'A' => 'TANAH',
        'B' => 'PERALATAN DAN MESIN',
        'C' => 'GEDUNG DAN BANGUNAN',
        'D' => 'JALAN, IRIGASI DAN JARINGAN',
        'E' => 'ASET TETAP LAINNYA',
        'L' => 'ASET LAINNYA',
    ];

    public function export(Request $request, string $kibSlug)
    {
        $kibType = strtoupper(str_replace('kib-', '', $kibSlug));

        if (! in_array($kibType, Asset::KIB_TYPES)) {
            abort(404);
        }

        $detailRelation = $this->getDetailRelation($kibType);

        $query = Asset::with(['wilayah:id,nama', $detailRelation])
            ->where('kib_type', $kibType);

        if ($wilayahId = $request->input('wilayah_id')) {
            $query->where('wilayah_id', $wilayahId);
        }

        $assets = $query->orderBy('kode_barang')->get();
        $totalHarga = $assets->sum('harga');

        $settings = $this->getSettings();
        $tanggal = now()->translatedFormat('d F Y');

        $viewName = 'exports.kib-' . strtolower($kibType);

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

        $filename = 'Rekapitulasi_' . str_replace(' ', '_', Asset::KIB_LABELS[$kibType]) . '_' . date('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }

    private function makeMpdf(): Mpdf
    {
        ini_set('pcre.backtrack_limit', '5000000');
        return new Mpdf([
            'format' => 'A4',
            'margin_top' => 25.4,
            'margin_bottom' => 25.4,
            'margin_left' => 25.4,
            'margin_right' => 25.4,
            'default_font' => 'dejavuserif',
            'default_font_size' => 12,
            'tempDir' => sys_get_temp_dir() . '/mpdf_' . getmypid(),
        ]);
    }

    public function paktaIntegritas(Request $request, Asset $asset)
    {
        if ($asset->kib_type !== 'B') {
            abort(404);
        }

        $asset->load('kibBDetail');
        $detail = $asset->kibBDetail;

        $settings = $this->getSettings();

        $nama = $request->input('nama', $asset->pj_nama);
        $nip = $request->input('nip', $asset->pj_nip ?? '');
        $jabatan = $request->input('jabatan', '');
        $tanggal = $request->input('tanggal')
            ? \Carbon\Carbon::parse($request->input('tanggal'))->translatedFormat('d F Y')
            : now()->translatedFormat('d F Y');

        $spesifikasi = [
            'Merk/Type' => $detail?->merk_type ?? '-',
            'Jenis/model' => $asset->nama_barang,
            'Nomor Polisi' => $detail?->nomor_polisi ?? '-',
            'Tahun Pembuatan' => $detail?->tahun_pembelian ?? '-',
        ];

        // Extract kabupaten name
        $kabkota = $settings['instansi_kabkota'] ?: 'Cilacap';
        $kabupaten = str_ireplace(['pemerintah kabupaten ', 'pemerintah kota ', 'kabupaten ', 'kota '], '', $kabkota);

        $html = view('exports.pakta-integritas', [
            'asset' => $asset,
            'settings' => $settings,
            'nama' => $nama,
            'nip' => $nip,
            'jabatan' => $jabatan,
            'tanggal' => $tanggal,
            'spesifikasi' => $spesifikasi,
            'kabupaten' => $kabupaten,
            'logoBase64' => $this->getLogoBase64(),
        ])->render();

        $mpdf = $this->makeMpdf();
        $mpdf->WriteHTML($html);

        $filename = 'Pakta_Integritas_' . str_replace(' ', '_', $asset->nama_barang) . '.pdf';

        return response($mpdf->Output($filename, 'S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }

    public function bast(Request $request, Asset $asset)
    {
        if ($asset->kib_type !== 'B') {
            abort(404);
        }

        $asset->load('kibBDetail');
        $detail = $asset->kibBDetail;

        $settings = $this->getSettings();

        $nomorSurat = $request->input('nomor_surat', '');
        $tanggalRaw = $request->input('tanggal', now()->format('Y-m-d'));
        $tanggalFormatted = \Carbon\Carbon::parse($tanggalRaw)->translatedFormat('d F Y');
        $tanggalTerbilang = $this->tanggalTerbilang($tanggalRaw);

        $pihak1Nama = $request->input('pihak1_nama', $settings['ttd_kepala_nama']);
        $pihak1Jabatan = $request->input('pihak1_jabatan', 'Kepala ' . ($settings['instansi_unit'] ?: 'Dinas'));
        $pihak1Nip = $request->input('pihak1_nip', $settings['ttd_kepala_nip']);

        $pihak2Nama = $request->input('pihak2_nama', $asset->pj_nama);
        $pihak2Jabatan = $request->input('pihak2_jabatan', '');
        $pihak2Nip = $request->input('pihak2_nip', $asset->pj_nip ?? '');

        $rincianBarang = [
            'Nama Barang' => $asset->nama_barang,
            'Merk/Type' => $detail?->merk_type ?? '-',
            'No. Rangka' => $detail?->nomor_rangka ?? '-',
            'No. Polisi' => $detail?->nomor_polisi ?? '-',
            'Tahun Perolehan' => $detail?->tahun_pembelian ?? '-',
            'Harga Perolehan' => 'Rp ' . number_format($asset->harga, 0, ',', '.') . ',-',
        ];

        // Extract kabupaten name
        $kabkota = $settings['instansi_kabkota'] ?: 'Cilacap';
        $kabupaten = str_ireplace(['pemerintah kabupaten ', 'pemerintah kota ', 'kabupaten ', 'kota '], '', $kabkota);

        $html = view('exports.bast', [
            'asset' => $asset,
            'settings' => $settings,
            'nomorSurat' => $nomorSurat,
            'tanggalFormatted' => $tanggalFormatted,
            'tanggalTerbilang' => $tanggalTerbilang,
            'pihak1Nama' => $pihak1Nama,
            'pihak1Jabatan' => $pihak1Jabatan,
            'pihak1Nip' => $pihak1Nip,
            'pihak2Nama' => $pihak2Nama,
            'pihak2Jabatan' => $pihak2Jabatan,
            'pihak2Nip' => $pihak2Nip,
            'rincianBarang' => $rincianBarang,
            'kabupaten' => $kabupaten,
            'logoBase64' => $this->getLogoBase64(),
        ])->render();

        $mpdf = $this->makeMpdf();
        $mpdf->SetTopMargin(15);
        $mpdf->WriteHTML($html);

        $filename = 'BAST_' . str_replace(' ', '_', $asset->nama_barang) . '.pdf';

        return response($mpdf->Output($filename, 'S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
        ]);
    }

    private function tanggalTerbilang(string $date): string
    {
        $carbon = \Carbon\Carbon::parse($date);

        $hari = [
            'Sunday' => 'Minggu', 'Monday' => 'Senin', 'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu', 'Thursday' => 'Kamis', 'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
        ];

        $bulan = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        $tglAngka = [
            1 => 'satu', 2 => 'dua', 3 => 'tiga', 4 => 'empat', 5 => 'lima',
            6 => 'enam', 7 => 'tujuh', 8 => 'delapan', 9 => 'sembilan', 10 => 'sepuluh',
            11 => 'sebelas', 12 => 'dua belas', 13 => 'tiga belas', 14 => 'empat belas',
            15 => 'lima belas', 16 => 'enam belas', 17 => 'tujuh belas', 18 => 'delapan belas',
            19 => 'sembilan belas', 20 => 'dua puluh', 21 => 'dua puluh satu',
            22 => 'dua puluh dua', 23 => 'dua puluh tiga', 24 => 'dua puluh empat',
            25 => 'dua puluh lima', 26 => 'dua puluh enam', 27 => 'dua puluh tujuh',
            28 => 'dua puluh delapan', 29 => 'dua puluh sembilan', 30 => 'tiga puluh',
            31 => 'tiga puluh satu',
        ];

        $tahunTerbilang = $this->angkaTerbilang($carbon->year);

        $namaHari = $hari[$carbon->format('l')] ?? $carbon->format('l');
        $tglTerbilang = $tglAngka[$carbon->day] ?? $carbon->day;
        $bulanNama = $bulan[$carbon->month] ?? $carbon->month;

        return "{$namaHari} tanggal {$tglTerbilang} bulan {$bulanNama} tahun {$tahunTerbilang} ({$carbon->format('d-m-Y')})";
    }

    private function angkaTerbilang(int $angka): string
    {
        $huruf = [
            '', 'satu', 'dua', 'tiga', 'empat', 'lima',
            'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas',
        ];

        if ($angka < 12) {
            return $huruf[$angka];
        } elseif ($angka < 20) {
            return $this->angkaTerbilang($angka - 10) . ' belas';
        } elseif ($angka < 100) {
            return $this->angkaTerbilang(intdiv($angka, 10)) . ' puluh ' . $this->angkaTerbilang($angka % 10);
        } elseif ($angka < 200) {
            return 'seratus ' . $this->angkaTerbilang($angka - 100);
        } elseif ($angka < 1000) {
            return $this->angkaTerbilang(intdiv($angka, 100)) . ' ratus ' . $this->angkaTerbilang($angka % 100);
        } elseif ($angka < 2000) {
            return 'seribu ' . $this->angkaTerbilang($angka - 1000);
        } elseif ($angka < 1000000) {
            return $this->angkaTerbilang(intdiv($angka, 1000)) . ' ribu ' . $this->angkaTerbilang($angka % 1000);
        }

        return trim((string) $angka);
    }
}
