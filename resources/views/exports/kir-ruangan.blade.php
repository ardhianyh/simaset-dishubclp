<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kartu Inventaris Ruangan - {{ $ruangan->nama }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 9pt; color: #000; }
        .page { padding: 8mm 8mm; }

        .header-wrapper { margin-bottom: 3mm; position: relative; min-height: 22mm; }
        .header-logo { position: absolute; top: 0; left: 0; width: 18mm; height: auto; }
        .header { text-align: center; padding-left: 22mm; }
        .header h2 { font-size: 10pt; font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; }
        .header h3 { font-size: 11pt; font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; }
        .header h4 { font-size: 10pt; font-weight: bold; margin-bottom: 0; }

        .info-wrapper { display: table; width: 100%; margin-bottom: 3mm; font-size: 8.5pt; }
        .info-left { display: table-cell; width: 65%; vertical-align: top; }
        .info-right { display: table-cell; width: 35%; vertical-align: bottom; text-align: right; font-weight: bold; font-size: 8pt; }
        .info-left table { border-collapse: collapse; }
        .info-left td { padding: 0.5px 2px; vertical-align: top; }
        .info-left .label { font-weight: bold; white-space: nowrap; }
        .info-left .separator { width: 10px; text-align: center; }

        table.data { width: 100%; border-collapse: collapse; margin-bottom: 3mm; font-size: 7pt; }
        table.data th, table.data td { border: 1px solid #000; padding: 1.5px 2px; vertical-align: middle; }
        table.data th { background-color: #e8e8e8; font-weight: bold; text-align: center; font-size: 6.5pt; }
        table.data td.number { text-align: right; }
        table.data td.center { text-align: center; }
        table.data tfoot td { font-weight: bold; }
        table.data tr.kolom-nomor td { text-align: center; font-weight: bold; font-size: 6.5pt; background-color: #f0f0f0; }

        .footer { margin-top: 4mm; }
        .footer-row { display: table; width: 100%; }
        .footer-col { display: table-cell; width: 25%; text-align: center; vertical-align: top; font-size: 8.5pt; }
        .ttd-space { height: 20mm; }
        .ttd-name { font-weight: bold; text-decoration: underline; }
        .ttd-nip { font-size: 7.5pt; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header-wrapper">
            @if(!empty($logoBase64))
                <img src="{{ $logoBase64 }}" class="header-logo" />
            @endif
            <div class="header">
                <h2>{{ $settings['instansi_kabkota'] ?: 'KABUPATEN ...' }}</h2>
                <h3>KARTU INVENTARIS RUANGAN</h3>
                <h4>PER {{ now()->format('d') }} -{{ ucfirst(now()->translatedFormat('F')) }}-{{ now()->format('Y') }}</h4>
            </div>
        </div>

        <div class="info-wrapper">
            <div class="info-left">
                <table>
                    <tr>
                        <td class="label">Provinsi</td>
                        <td class="separator">:</td>
                        <td>{{ $settings['instansi_provinsi'] }}</td>
                    </tr>
                    <tr>
                        <td class="label">Kab./Kota</td>
                        <td class="separator">:</td>
                        <td>{{ $settings['instansi_kabkota'] }}</td>
                    </tr>
                    <tr>
                        <td class="label">Bidang</td>
                        <td class="separator">:</td>
                        <td>{{ $settings['instansi_bidang'] }}</td>
                    </tr>
                    <tr>
                        <td class="label">Unit Organisasi</td>
                        <td class="separator">:</td>
                        <td>{{ $settings['instansi_unit'] }}</td>
                    </tr>
                    <tr>
                        <td class="label">Sub Unit Organisasi</td>
                        <td class="separator">:</td>
                        <td>{{ $settings['instansi_sub_unit'] }}</td>
                    </tr>
                    <tr>
                        <td class="label">U P B</td>
                        <td class="separator">:</td>
                        <td>{{ $settings['instansi_sub_unit'] }}</td>
                    </tr>
                    <tr>
                        <td class="label">Ruangan</td>
                        <td class="separator">:</td>
                        <td>{{ strtoupper($ruangan->nama) }}</td>
                    </tr>
                </table>
            </div>
            <div class="info-right">
                NO. KODE LOKASI&nbsp;:&nbsp;{{ $settings['instansi_kode_lokasi'] }}
            </div>
        </div>

        <table class="data">
            <thead>
                <tr>
                    <th rowspan="2" style="width:18px">No.</th>
                    <th rowspan="2">Jenis Barang /<br>Nama Barang</th>
                    <th rowspan="2">Merk /<br>Model</th>
                    <th rowspan="2">No. Seri<br>Pabrik</th>
                    <th rowspan="2">Ukuran</th>
                    <th rowspan="2">Bahan</th>
                    <th rowspan="2">Tahun<br>Pembuatan/<br>Pembelian</th>
                    <th rowspan="2">No. Kode<br>Barang</th>
                    <th rowspan="2">Jumlah<br>Barang/<br>Register</th>
                    <th rowspan="2">Harga Beli/<br>Perolehan</th>
                    <th colspan="3">Keadaan Barang</th>
                    <th rowspan="2">Keterangan</th>
                </tr>
                <tr>
                    <th>Baik<br>(B)</th>
                    <th>Kurang<br>Baik<br>(KB)</th>
                    <th>Rusak<br>Berat<br>(RB)</th>
                </tr>
                <tr class="kolom-nomor">
                    <td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td>
                    <td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td><td>14</td>
                </tr>
            </thead>
            <tbody>
                @forelse($assets as $i => $asset)
                @php
                    $merk = null; $noSeri = null; $ukuran = null;
                    $bahan = null; $tahun = null; $jumlah = 1; $kondisi = null;

                    switch ($asset->kib_type) {
                        case 'A':
                            $d = $asset->kibADetail;
                            $ukuran = $d?->luas_m2 ? number_format($d->luas_m2, 2, ',', '.') . ' m²' : null;
                            $tahun = $d?->tahun_pengadaan;
                            break;
                        case 'B':
                            $d = $asset->kibBDetail;
                            $merk = $d?->merk_type;
                            $noSeri = $d?->nomor_pabrik;
                            $ukuran = $d?->ukuran_cc;
                            $bahan = $d?->bahan;
                            $tahun = $d?->tahun_pembelian;
                            break;
                        case 'C':
                            $d = $asset->kibCDetail;
                            $ukuran = $d?->luas_lantai_m2 ? number_format($d->luas_lantai_m2, 2, ',', '.') . ' m²' : null;
                            $kondisi = $d?->kondisi;
                            break;
                        case 'D':
                            $d = $asset->kibDDetail;
                            $bahan = $d?->konstruksi;
                            $ukuran = $d?->panjang_km ? number_format($d->panjang_km, 3, ',', '.') . ' km' : null;
                            $kondisi = $d?->kondisi;
                            break;
                        case 'E':
                            $d = $asset->kibEDetail;
                            $merk = $d?->judul_pencipta;
                            $ukuran = $d?->ukuran;
                            $bahan = $d?->bahan;
                            $tahun = $d?->tahun_cetak;
                            $jumlah = $d?->jumlah ?? 1;
                            break;
                        case 'L':
                            $d = $asset->kibLDetail;
                            $merk = $d?->judul_nama;
                            $tahun = $d?->tahun_pengadaan;
                            $kondisi = $d?->kondisi;
                            break;
                    }

                    $baik      = ($kondisi === null || $kondisi === 'Baik') ? $jumlah : 0;
                    $kurangBaik = ($kondisi === 'Kurang Baik') ? $jumlah : 0;
                    $rusakBerat = ($kondisi === 'Rusak Berat') ? $jumlah : 0;
                @endphp
                <tr>
                    <td class="center">{{ $i + 1 }}</td>
                    <td>{{ $asset->nama_barang }}</td>
                    <td>{{ $merk ?? '-' }}</td>
                    <td>{{ $noSeri ?? '-' }}</td>
                    <td>{{ $ukuran ?? '-' }}</td>
                    <td>{{ $bahan ?? '-' }}</td>
                    <td class="center">{{ $tahun ?? '-' }}</td>
                    <td>{{ $asset->kode_barang ?? '-' }}</td>
                    <td class="center">{{ $jumlah }}</td>
                    <td class="number">{{ number_format($asset->harga, 2, ',', '.') }}</td>
                    <td class="center">{{ $baik }}</td>
                    <td class="center">{{ $kurangBaik }}</td>
                    <td class="center">{{ $rusakBerat }}</td>
                    <td>{{ $asset->keterangan ?? '-' }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="14" style="text-align:center; padding: 4mm;">Tidak ada data aset pada ruangan ini.</td>
                </tr>
                @endforelse
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="9" style="text-align:right;">Jumlah Harga</td>
                    <td class="number">{{ number_format($totalHarga, 2, ',', '.') }}</td>
                    <td colspan="4"></td>
                </tr>
            </tfoot>
        </table>

        <div class="footer">
            <div class="footer-row">
                <div class="footer-col">
                    <p>MENGETAHUI</p>
                    <p>KEPALA DINAS</p>
                    <div class="ttd-space"></div>
                    <p class="ttd-name">{{ $kepalaNama ?: '&nbsp;' }}</p>
                    <p class="ttd-nip">NIP. {{ $kepalaNip ?: '&nbsp;' }}</p>
                </div>
                <div class="footer-col">
                    <p>PETUGAS PENGURUS BARANG</p>
                    <div class="ttd-space"></div>
                    <p class="ttd-name">{{ $pengurusNama ?: '&nbsp;' }}</p>
                    <p class="ttd-nip">NIP. {{ $pengurusNip ?: '&nbsp;' }}</p>
                </div>
                <div class="footer-col">
                    <p>PETUGAS PENGURUS BARANG</p>
                    <p>RUANGAN</p>
                    <div class="ttd-space"></div>
                    <p class="ttd-name">{{ $pengurusRuanganNama ?: '&nbsp;' }}</p>
                    <p class="ttd-nip">NIP. {{ $pengurusRuanganNip ?: '&nbsp;' }}</p>
                </div>
                <div class="footer-col">
                    <p>{{ $settings['ttd_kota'] ?: '............' }}, {{ $tanggal }}</p>
                    <p>Penanggung Jawab Ruangan</p>
                    <div class="ttd-space"></div>
                    <p class="ttd-name">{{ $pjRuanganNama ?: '&nbsp;' }}</p>
                    <p class="ttd-nip">NIP. {{ $pjRuanganNip ?: '&nbsp;' }}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
