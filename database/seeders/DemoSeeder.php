<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\KibADetail;
use App\Models\KibBDetail;
use App\Models\KibCDetail;
use App\Models\KibDDetail;
use App\Models\KibEDetail;
use App\Models\KibLDetail;
use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // ── Wilayah ─────────────────────────────────────────
        $wilayahs = collect([
            ['nama' => 'Kecamatan Cilacap Selatan', 'deskripsi' => 'Wilayah kerja Kecamatan Cilacap Selatan'],
            ['nama' => 'Kecamatan Cilacap Tengah', 'deskripsi' => 'Wilayah kerja Kecamatan Cilacap Tengah'],
            ['nama' => 'Kecamatan Cilacap Utara', 'deskripsi' => 'Wilayah kerja Kecamatan Cilacap Utara'],
            ['nama' => 'Kecamatan Majenang', 'deskripsi' => 'Wilayah kerja Kecamatan Majenang'],
            ['nama' => 'Kecamatan Sidareja', 'deskripsi' => 'Wilayah kerja Kecamatan Sidareja'],
        ])->map(fn ($data) => Wilayah::create($data));

        // ── Staff Users ─────────────────────────────────────
        $staffUsers = [];

        $staff1 = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@simaset.local',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'nip' => '198501152010011005',
            'telepon' => '081234567890',
            'is_active' => true,
        ]);
        $staff1->assignRole('staff');
        $staff1->wilayahs()->attach([$wilayahs[0]->id, $wilayahs[1]->id]);
        $staffUsers[] = $staff1;

        $staff2 = User::create([
            'name' => 'Siti Rahayu',
            'email' => 'siti@simaset.local',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'nip' => '199003222015022001',
            'telepon' => '081298765432',
            'is_active' => true,
        ]);
        $staff2->assignRole('staff');
        $staff2->wilayahs()->attach([$wilayahs[2]->id, $wilayahs[3]->id]);
        $staffUsers[] = $staff2;

        $staff3 = User::create([
            'name' => 'Ahmad Fauzi',
            'email' => 'ahmad@simaset.local',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'nip' => '198712012012031002',
            'telepon' => '085712345678',
            'is_active' => true,
        ]);
        $staff3->assignRole('staff');
        $staff3->wilayahs()->attach([$wilayahs[4]->id]);
        $staffUsers[] = $staff3;

        // Assign all wilayah to admin
        $admin = User::where('email', 'admin@simaset.local')->first();
        if ($admin) {
            $admin->wilayahs()->attach($wilayahs->pluck('id'));
        }

        $adminId = $admin?->id;

        // ── KIB A – Tanah ───────────────────────────────────
        $kibAData = [
            [
                'nama_barang' => 'Tanah Kantor Dinas Perhubungan',
                'kode_barang' => '01.01.11.01.01',
                'nomor_register' => '0001',
                'harga' => 2500000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.7271681,
                'longitude' => 109.0068793,
                'pj_nama' => 'Budi Santoso',
                'pj_nip' => '198501152010011005',
                'detail' => ['luas_m2' => 5000, 'tahun_pengadaan' => 2005, 'alamat' => 'Jl. Jend. Sudirman No. 1, Cilacap', 'hak_tanah' => 'Hak Pakai', 'sertifikat_tanggal' => '2005-08-15', 'sertifikat_nomor' => 'HP/001/2005', 'penggunaan' => 'Kantor Dinas'],
            ],
            [
                'nama_barang' => 'Tanah Terminal Cilacap',
                'kode_barang' => '01.01.11.01.02',
                'nomor_register' => '0002',
                'harga' => 8500000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.7181290,
                'longitude' => 109.0152534,
                'pj_nama' => 'Budi Santoso',
                'pj_nip' => '198501152010011005',
                'detail' => ['luas_m2' => 15000, 'tahun_pengadaan' => 2001, 'alamat' => 'Jl. Terminal No. 5, Cilacap', 'hak_tanah' => 'Hak Pakai', 'sertifikat_tanggal' => '2001-03-20', 'sertifikat_nomor' => 'HP/002/2001', 'penggunaan' => 'Terminal Bus'],
            ],
            [
                'nama_barang' => 'Tanah Parkir Pelabuhan',
                'kode_barang' => '01.01.11.01.03',
                'nomor_register' => '0003',
                'harga' => 3200000000,
                'asal_usul' => 'Hibah',
                'latitude' => -7.7391122,
                'longitude' => 109.0218743,
                'pj_nama' => 'Siti Rahayu',
                'pj_nip' => '199003222015022001',
                'detail' => ['luas_m2' => 8000, 'tahun_pengadaan' => 2010, 'alamat' => 'Jl. Pelabuhan No. 12, Cilacap', 'hak_tanah' => 'Hak Pakai', 'sertifikat_tanggal' => '2010-06-01', 'sertifikat_nomor' => 'HP/003/2010', 'penggunaan' => 'Area Parkir'],
            ],
        ];

        foreach ($kibAData as $i => $data) {
            $detail = $data['detail'];
            unset($data['detail']);
            $asset = Asset::withoutGlobalScopes()->create(array_merge($data, [
                'kib_type' => 'A',
                'wilayah_id' => $wilayahs[$i % $wilayahs->count()]->id,
                'created_by' => $adminId,
            ]));
            KibADetail::create(array_merge($detail, ['asset_id' => $asset->id]));
        }

        // ── KIB B – Peralatan & Mesin ───────────────────────
        $kibBData = [
            [
                'nama_barang' => 'Kendaraan Dinas Roda 4 Toyota Avanza',
                'kode_barang' => '02.03.01.05.01',
                'nomor_register' => '0001',
                'harga' => 235000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.7275000,
                'longitude' => 109.0070000,
                'pj_nama' => 'Budi Santoso',
                'pj_nip' => '198501152010011005',
                'detail' => ['merk_type' => 'Toyota Avanza 1.3 G', 'ukuran_cc' => '1300', 'bahan' => 'Besi', 'tahun_pembelian' => 2022, 'nomor_pabrik' => 'FAB-20220515', 'nomor_rangka' => 'MHFM1BA3JNK123456', 'nomor_mesin' => '1NR-F234567', 'nomor_polisi' => 'R 1234 AB', 'nomor_bpkb' => 'K-12345678'],
            ],
            [
                'nama_barang' => 'Kendaraan Dinas Roda 2 Honda Vario',
                'kode_barang' => '02.03.01.02.01',
                'nomor_register' => '0002',
                'harga' => 22000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.7276000,
                'longitude' => 109.0071000,
                'pj_nama' => 'Ahmad Fauzi',
                'pj_nip' => '198712012012031002',
                'detail' => ['merk_type' => 'Honda Vario 125 CBS', 'ukuran_cc' => '125', 'bahan' => 'Besi', 'tahun_pembelian' => 2023, 'nomor_pabrik' => 'HON-20230101', 'nomor_rangka' => 'MH1JFZ119NK000001', 'nomor_mesin' => 'JFZ1E-1234567', 'nomor_polisi' => 'R 5678 CD', 'nomor_bpkb' => 'K-98765432'],
            ],
            [
                'nama_barang' => 'Komputer Desktop Lenovo ThinkCentre',
                'kode_barang' => '02.06.02.01.05',
                'nomor_register' => '0003',
                'harga' => 15000000,
                'asal_usul' => 'Pembelian',
                'pj_nama' => 'Siti Rahayu',
                'pj_nip' => '199003222015022001',
                'detail' => ['merk_type' => 'Lenovo ThinkCentre M70s Gen 4', 'ukuran_cc' => null, 'bahan' => 'Plastik/Besi', 'tahun_pembelian' => 2024, 'nomor_pabrik' => 'LNV-M70S-2024001', 'nomor_rangka' => null, 'nomor_mesin' => null, 'nomor_polisi' => null, 'nomor_bpkb' => null],
            ],
            [
                'nama_barang' => 'Printer HP LaserJet Pro',
                'kode_barang' => '02.06.02.06.02',
                'nomor_register' => '0004',
                'harga' => 8500000,
                'asal_usul' => 'Pembelian',
                'pj_nama' => 'Siti Rahayu',
                'pj_nip' => '199003222015022001',
                'detail' => ['merk_type' => 'HP LaserJet Pro M404dn', 'ukuran_cc' => null, 'bahan' => 'Plastik', 'tahun_pembelian' => 2024, 'nomor_pabrik' => 'HP-LJ404-2024001', 'nomor_rangka' => null, 'nomor_mesin' => null, 'nomor_polisi' => null, 'nomor_bpkb' => null],
            ],
            [
                'nama_barang' => 'AC Split Daikin 2 PK',
                'kode_barang' => '02.06.03.04.01',
                'nomor_register' => '0005',
                'harga' => 12000000,
                'asal_usul' => 'Pembelian',
                'pj_nama' => 'Budi Santoso',
                'pj_nip' => '198501152010011005',
                'detail' => ['merk_type' => 'Daikin FTKC50TVM4', 'ukuran_cc' => null, 'bahan' => 'Besi/Plastik', 'tahun_pembelian' => 2023, 'nomor_pabrik' => 'DKN-2023-0052', 'nomor_rangka' => null, 'nomor_mesin' => null, 'nomor_polisi' => null, 'nomor_bpkb' => null],
            ],
        ];

        foreach ($kibBData as $i => $data) {
            $detail = $data['detail'];
            unset($data['detail']);
            $asset = Asset::withoutGlobalScopes()->create(array_merge($data, [
                'kib_type' => 'B',
                'wilayah_id' => $wilayahs[$i % $wilayahs->count()]->id,
                'created_by' => $adminId,
            ]));
            KibBDetail::create(array_merge($detail, ['asset_id' => $asset->id]));
        }

        // ── KIB C – Gedung & Bangunan ───────────────────────
        $kibCData = [
            [
                'nama_barang' => 'Gedung Kantor Dinas Perhubungan',
                'kode_barang' => '03.11.01.01.01',
                'nomor_register' => '0001',
                'harga' => 4500000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.7272000,
                'longitude' => 109.0069000,
                'pj_nama' => 'Budi Santoso',
                'pj_nip' => '198501152010011005',
                'detail' => ['kondisi' => 'Baik', 'bertingkat' => true, 'beton' => true, 'luas_lantai_m2' => 1200, 'alamat' => 'Jl. Jend. Sudirman No. 1, Cilacap', 'dokumen_tanggal' => '2008-12-10', 'dokumen_nomor' => 'IMB/123/2008', 'status_tanah' => 'Hak Pakai', 'nomor_kode_tanah' => '01.01.11.01.01'],
            ],
            [
                'nama_barang' => 'Gedung Terminal Penumpang',
                'kode_barang' => '03.11.01.10.01',
                'nomor_register' => '0002',
                'harga' => 6800000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.7182000,
                'longitude' => 109.0153000,
                'pj_nama' => 'Siti Rahayu',
                'pj_nip' => '199003222015022001',
                'detail' => ['kondisi' => 'Kurang Baik', 'bertingkat' => false, 'beton' => true, 'luas_lantai_m2' => 3500, 'alamat' => 'Jl. Terminal No. 5, Cilacap', 'dokumen_tanggal' => '2003-05-22', 'dokumen_nomor' => 'IMB/045/2003', 'status_tanah' => 'Hak Pakai', 'nomor_kode_tanah' => '01.01.11.01.02'],
            ],
            [
                'nama_barang' => 'Pos Jaga UPPKB Majenang',
                'kode_barang' => '03.11.01.05.01',
                'nomor_register' => '0003',
                'harga' => 350000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.2971000,
                'longitude' => 108.7576000,
                'pj_nama' => 'Ahmad Fauzi',
                'pj_nip' => '198712012012031002',
                'detail' => ['kondisi' => 'Baik', 'bertingkat' => false, 'beton' => true, 'luas_lantai_m2' => 60, 'alamat' => 'Jl. Raya Majenang KM 5', 'dokumen_tanggal' => '2019-09-15', 'dokumen_nomor' => 'IMB/089/2019', 'status_tanah' => 'Hak Pakai', 'nomor_kode_tanah' => '01.01.11.03.01'],
            ],
            [
                'nama_barang' => 'Gedung Workshop Pengujian Kendaraan',
                'kode_barang' => '03.11.01.08.01',
                'nomor_register' => '0004',
                'harga' => 1800000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.7260000,
                'longitude' => 109.0050000,
                'pj_nama' => 'Budi Santoso',
                'pj_nip' => '198501152010011005',
                'detail' => ['kondisi' => 'Baik', 'bertingkat' => false, 'beton' => true, 'luas_lantai_m2' => 800, 'alamat' => 'Jl. Jend. Sudirman No. 3, Cilacap', 'dokumen_tanggal' => '2015-04-20', 'dokumen_nomor' => 'IMB/067/2015', 'status_tanah' => 'Hak Pakai', 'nomor_kode_tanah' => '01.01.11.01.01'],
            ],
        ];

        foreach ($kibCData as $i => $data) {
            $detail = $data['detail'];
            unset($data['detail']);
            $asset = Asset::withoutGlobalScopes()->create(array_merge($data, [
                'kib_type' => 'C',
                'wilayah_id' => $wilayahs[$i % $wilayahs->count()]->id,
                'created_by' => $adminId,
            ]));
            KibCDetail::create(array_merge($detail, ['asset_id' => $asset->id]));
        }

        // ── KIB D – Jalan, Irigasi, Jaringan ────────────────
        $kibDData = [
            [
                'nama_barang' => 'Jalan Akses Terminal Cilacap',
                'kode_barang' => '04.13.01.01.01',
                'nomor_register' => '0001',
                'harga' => 5200000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.7200000,
                'longitude' => 109.0100000,
                'pj_nama' => 'Budi Santoso',
                'pj_nip' => '198501152010011005',
                'detail' => ['konstruksi' => 'Aspal Hotmix', 'panjang_km' => 2.500, 'lebar_m' => 8.000, 'luas_m2' => 20000, 'alamat' => 'Jl. Terminal - Jl. Jend. Sudirman, Cilacap', 'dokumen_tanggal' => '2018-11-25', 'dokumen_nomor' => 'KONT/234/2018', 'status_tanah' => 'Tanah Negara', 'nomor_kode_tanah' => '04.01.01.01.01', 'kondisi' => 'Baik'],
            ],
            [
                'nama_barang' => 'Jaringan Lampu Lalu Lintas Simpang Lima',
                'kode_barang' => '04.14.02.01.01',
                'nomor_register' => '0002',
                'harga' => 850000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.7265000,
                'longitude' => 109.0085000,
                'pj_nama' => 'Siti Rahayu',
                'pj_nip' => '199003222015022001',
                'detail' => ['konstruksi' => 'Tiang Besi Galvanis + LED', 'panjang_km' => null, 'lebar_m' => null, 'luas_m2' => null, 'alamat' => 'Simpang Lima, Cilacap Tengah', 'dokumen_tanggal' => '2021-07-12', 'dokumen_nomor' => 'KONT/089/2021', 'status_tanah' => 'Jalan Kabupaten', 'nomor_kode_tanah' => null, 'kondisi' => 'Baik'],
            ],
            [
                'nama_barang' => 'Saluran Drainase Terminal',
                'kode_barang' => '04.13.02.01.01',
                'nomor_register' => '0003',
                'harga' => 420000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.7183000,
                'longitude' => 109.0154000,
                'pj_nama' => 'Ahmad Fauzi',
                'pj_nip' => '198712012012031002',
                'detail' => ['konstruksi' => 'Beton Bertulang U-Ditch', 'panjang_km' => 1.200, 'lebar_m' => 0.800, 'luas_m2' => 960, 'alamat' => 'Area Terminal Cilacap', 'dokumen_tanggal' => '2020-03-10', 'dokumen_nomor' => 'KONT/015/2020', 'status_tanah' => 'Tanah Negara', 'nomor_kode_tanah' => '01.01.11.01.02', 'kondisi' => 'Kurang Baik'],
            ],
        ];

        foreach ($kibDData as $i => $data) {
            $detail = $data['detail'];
            unset($data['detail']);
            $asset = Asset::withoutGlobalScopes()->create(array_merge($data, [
                'kib_type' => 'D',
                'wilayah_id' => $wilayahs[$i % $wilayahs->count()]->id,
                'created_by' => $adminId,
            ]));
            KibDDetail::create(array_merge($detail, ['asset_id' => $asset->id]));
        }

        // ── KIB E – Aset Tetap Lainnya ──────────────────────
        $kibEData = [
            [
                'nama_barang' => 'Buku Peraturan Lalu Lintas 2023',
                'kode_barang' => '05.16.01.01.01',
                'nomor_register' => '0001',
                'harga' => 2500000,
                'asal_usul' => 'Pembelian',
                'pj_nama' => 'Siti Rahayu',
                'pj_nip' => '199003222015022001',
                'detail' => ['judul_pencipta' => 'Peraturan Lalu Lintas & Angkutan Jalan', 'spesifikasi' => 'Buku referensi hukum, hardcover, 450 halaman', 'asal_daerah' => 'Jakarta', 'pencipta' => 'Kementerian Perhubungan', 'bahan' => 'Kertas HVS 80gsm', 'jenis' => 'Buku', 'ukuran' => '25 x 18 cm', 'jumlah' => 10, 'tahun_cetak' => 2023],
            ],
            [
                'nama_barang' => 'Koleksi Tanda Rambu Lalu Lintas Antik',
                'kode_barang' => '05.16.02.02.01',
                'nomor_register' => '0002',
                'harga' => 15000000,
                'asal_usul' => 'Hibah',
                'pj_nama' => 'Budi Santoso',
                'pj_nip' => '198501152010011005',
                'detail' => ['judul_pencipta' => 'Koleksi Rambu Lalu Lintas Era Kolonial', 'spesifikasi' => 'Rambu lalu lintas bersejarah dari era Hindia Belanda', 'asal_daerah' => 'Cilacap', 'pencipta' => 'Pemerintah Hindia Belanda', 'bahan' => 'Besi Cor', 'jenis' => 'Kesenian', 'ukuran' => 'Beragam', 'jumlah' => 5, 'tahun_cetak' => 1940],
            ],
            [
                'nama_barang' => 'Herbarium Tanaman Penghijauan Jalan',
                'kode_barang' => '05.16.03.01.01',
                'nomor_register' => '0003',
                'harga' => 5000000,
                'asal_usul' => 'Lainnya',
                'pj_nama' => 'Ahmad Fauzi',
                'pj_nip' => '198712012012031002',
                'detail' => ['judul_pencipta' => 'Herbarium Pohon Peneduh Jalan Kabupaten Cilacap', 'spesifikasi' => 'Koleksi spesimen kering tanaman', 'asal_daerah' => 'Cilacap', 'pencipta' => 'Tim PKL Unsoed', 'bahan' => 'Spesimen Kering', 'jenis' => 'Hewan/Tumbuhan', 'ukuran' => '30 x 40 cm per lembar', 'jumlah' => 25, 'tahun_cetak' => 2022],
            ],
        ];

        foreach ($kibEData as $i => $data) {
            $detail = $data['detail'];
            unset($data['detail']);
            $asset = Asset::withoutGlobalScopes()->create(array_merge($data, [
                'kib_type' => 'E',
                'wilayah_id' => $wilayahs[$i % $wilayahs->count()]->id,
                'created_by' => $adminId,
            ]));
            KibEDetail::create(array_merge($detail, ['asset_id' => $asset->id]));
        }

        // ── KIB L – Aset Lainnya ────────────────────────────
        $kibLData = [
            [
                'nama_barang' => 'Software Sistem Manajemen Parkir',
                'kode_barang' => '06.01.01.01.01',
                'nomor_register' => '0001',
                'harga' => 75000000,
                'asal_usul' => 'Pembelian',
                'pj_nama' => 'Siti Rahayu',
                'pj_nip' => '199003222015022001',
                'detail' => ['tahun_pengadaan' => 2023, 'judul_nama' => 'SmartPark Management System v3.0', 'pencipta' => 'PT Solusi Digital Nusantara', 'spesifikasi' => 'Sistem manajemen parkir terintegrasi, lisensi 5 tahun, include maintenance', 'kondisi' => 'Baik'],
            ],
            [
                'nama_barang' => 'Lisensi Microsoft Office 365 Business',
                'kode_barang' => '06.01.01.02.01',
                'nomor_register' => '0002',
                'harga' => 25000000,
                'asal_usul' => 'Pembelian',
                'pj_nama' => 'Budi Santoso',
                'pj_nip' => '198501152010011005',
                'detail' => ['tahun_pengadaan' => 2024, 'judul_nama' => 'Microsoft 365 Business Standard', 'pencipta' => 'Microsoft Corporation', 'spesifikasi' => 'Lisensi tahunan untuk 20 user, termasuk Teams, SharePoint, OneDrive', 'kondisi' => 'Baik'],
            ],
            [
                'nama_barang' => 'Aset Tak Berwujud - Kajian Transportasi',
                'kode_barang' => '06.01.02.01.01',
                'nomor_register' => '0003',
                'harga' => 180000000,
                'asal_usul' => 'Pembelian',
                'pj_nama' => 'Ahmad Fauzi',
                'pj_nip' => '198712012012031002',
                'detail' => ['tahun_pengadaan' => 2022, 'judul_nama' => 'Kajian Masterplan Transportasi Publik Kabupaten Cilacap 2022-2032', 'pencipta' => 'PT Konsultan Transportasi Indonesia', 'spesifikasi' => 'Dokumen kajian masterplan transportasi, 5 volume, termasuk peta digital dan data GIS', 'kondisi' => 'Baik'],
            ],
            [
                'nama_barang' => 'Aset Dalam Renovasi - Terminal Sidareja',
                'kode_barang' => '06.02.01.01.01',
                'nomor_register' => '0004',
                'harga' => 2500000000,
                'asal_usul' => 'Pembelian',
                'latitude' => -7.4850000,
                'longitude' => 108.8210000,
                'pj_nama' => 'Ahmad Fauzi',
                'pj_nip' => '198712012012031002',
                'detail' => ['tahun_pengadaan' => 2025, 'judul_nama' => 'Renovasi Terminal Tipe C Sidareja', 'pencipta' => 'PT Bangun Jaya Konstruksi', 'spesifikasi' => 'Renovasi total terminal tipe C meliputi ruang tunggu, kantor, toilet, dan area parkir. Progres 65%.', 'kondisi' => 'Dalam Renovasi'],
            ],
        ];

        foreach ($kibLData as $i => $data) {
            $detail = $data['detail'];
            unset($data['detail']);
            $asset = Asset::withoutGlobalScopes()->create(array_merge($data, [
                'kib_type' => 'L',
                'wilayah_id' => $wilayahs[$i % $wilayahs->count()]->id,
                'created_by' => $adminId,
            ]));
            KibLDetail::create(array_merge($detail, ['asset_id' => $asset->id]));
        }

        $this->command->info('Demo data seeded: 5 wilayah, 3 staff users, 22 assets (3 KIB-A, 5 KIB-B, 4 KIB-C, 3 KIB-D, 3 KIB-E, 4 KIB-L)');
    }
}
