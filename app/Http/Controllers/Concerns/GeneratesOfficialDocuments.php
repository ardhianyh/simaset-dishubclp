<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Setting;
use Mpdf\Mpdf;

/**
 * Helper bersama untuk dokumen resmi (rekap KIB, KIR, BAST, Pakta Integritas).
 */
trait GeneratesOfficialDocuments
{
    public const NAMA_BULAN = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    protected function getLogoBase64(): ?string
    {
        $logoPath = public_path('logo.png');
        if (file_exists($logoPath)) {
            $data = base64_encode(file_get_contents($logoPath));
            $mime = mime_content_type($logoPath);

            return "data:{$mime};base64,{$data}";
        }

        return null;
    }

    protected function getSettings(): array
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

    protected function makeMpdf(): Mpdf
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
            'tempDir' => sys_get_temp_dir().'/mpdf_'.getmypid(),
        ]);
    }

    protected function tanggalTerbilang(string $date): string
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

    protected function angkaTerbilang(int $angka): string
    {
        $huruf = [
            '', 'satu', 'dua', 'tiga', 'empat', 'lima',
            'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas',
        ];

        if ($angka < 12) {
            return $huruf[$angka];
        } elseif ($angka < 20) {
            return $this->angkaTerbilang($angka - 10).' belas';
        } elseif ($angka < 100) {
            return $this->angkaTerbilang(intdiv($angka, 10)).' puluh '.$this->angkaTerbilang($angka % 10);
        } elseif ($angka < 200) {
            return 'seratus '.$this->angkaTerbilang($angka - 100);
        } elseif ($angka < 1000) {
            return $this->angkaTerbilang(intdiv($angka, 100)).' ratus '.$this->angkaTerbilang($angka % 100);
        } elseif ($angka < 2000) {
            return 'seribu '.$this->angkaTerbilang($angka - 1000);
        } elseif ($angka < 1000000) {
            return $this->angkaTerbilang(intdiv($angka, 1000)).' ribu '.$this->angkaTerbilang($angka % 1000);
        }

        return trim((string) $angka);
    }
}
