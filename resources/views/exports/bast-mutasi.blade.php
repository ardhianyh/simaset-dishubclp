<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>BAST Pergeseran Barang</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; line-height: 1.5; }

        .kop-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
        .kop-logo-cell { width: 27mm; vertical-align: middle; text-align: left; }
        .kop-logo-cell img { width: 25mm; height: auto; }
        .kop-text-cell { vertical-align: middle; text-align: center; padding-left: 3mm; }
        .kop-h2 { font-size: 14pt; font-weight: normal; text-transform: uppercase; letter-spacing: 1px; line-height: 1.3; }
        .kop-h1 { font-size: 22pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; line-height: 1.2; }
        .kop-alamat { font-size: 9pt; margin-top: 2mm; line-height: 1.4; }
        .kop-border { border-bottom: 3px double #000; margin-top: 2mm; margin-bottom: 2mm; }

        .judul { text-align: center; margin: 0 0 2mm 0; }
        .judul h3 { font-size: 12pt; font-weight: bold; line-height: 1.2; }
        .judul .nomor { font-size: 11pt; margin-top: 2mm; text-align: center; }

        p { margin-bottom: 3mm; text-align: justify; }
        .p-indent { text-indent: 15mm; }

        .pihak-table { width: 100%; margin: 3mm 0; border-collapse: collapse; }
        .pihak-table td { padding: 2px 4px; vertical-align: top; }
        .pihak-table .no { width: 8mm; }
        .pihak-table .nama { white-space: nowrap; padding-right: 4mm; }
        .pihak-table .sep { width: 8mm; text-align: center; }

        .pasal { text-align: center; font-weight: bold; margin: 5mm 0 3mm 0; }

        table.barang { width: 100%; border-collapse: collapse; margin: 3mm 0; font-size: 10pt; }
        table.barang th, table.barang td { border: 1px solid #000; padding: 3px 4px; vertical-align: top; }
        table.barang th { background-color: #e8e8e8; text-align: center; font-weight: bold; }
        table.barang td.center { text-align: center; }
        table.barang td.number { text-align: right; }

        .pasal3-table { width: 100%; border-collapse: collapse; margin-bottom: 3mm; }
        .pasal3-table td { vertical-align: top; padding: 0 4px 0 0; text-align: justify; }
        .pasal3-table .num { width: 10mm; white-space: nowrap; }

        .ttd-space { height: 28mm; }
        .ttd-name { font-weight: bold; text-decoration: underline; white-space: nowrap; }
        .ttd-nip { font-size: 10pt; }
    </style>
</head>
<body>
    <!-- KOP SURAT -->
    <table class="kop-table">
        <tr>
            @if($logoBase64)
            <td class="kop-logo-cell">
                <img src="{{ $logoBase64 }}" style="width: 25mm; height: auto;" />
            </td>
            @endif
            <td class="kop-text-cell">
                <div class="kop-h2">{{ $settings['instansi_nama'] ?: 'PEMERINTAH KABUPATEN CILACAP' }}</div>
                <div class="kop-h1">{{ $settings['instansi_unit'] ?: 'DINAS PERHUBUNGAN' }}</div>
                <div class="kop-alamat">
                    {{ $settings['instansi_alamat'] ?: 'Jalan MT. Haryono Nomor 29, Tegalreja, Cilacap Selatan, Cilacap, Jawa Tengah 53213' }},<br>
                    Telepon {{ $settings['instansi_telepon'] ?: '(0282) 534725' }}, Faksimile {{ $settings['instansi_fax'] ?: '(0282) 521881' }},<br>
                    Laman : {{ $settings['instansi_website'] ?: 'www.dishub.cilacapkab.go.id' }}, Pos-el : {{ $settings['instansi_email'] ?: 'dishub@cilacapkab.go.id' }}
                </div>
            </td>
        </tr>
    </table>
    <div class="kop-border"></div>

    <!-- JUDUL -->
    <div class="judul">
        <h3>BERITA ACARA SERAH TERIMA BARANG INVENTARIS<br>{{ $gantiPj ? 'ANTAR PENANGGUNG JAWAB' : 'ANTAR RUANGAN' }}</h3>
        @if($nomorSurat)
            <p class="nomor">Nomor : {{ $nomorSurat }}</p>
        @endif
    </div>

    <!-- PEMBUKAAN -->
    <p class="p-indent">Pada hari ini {{ $tanggalTerbilang }}, kami yang bertanda tangan dibawah ini :</p>

    <table class="pihak-table">
        <tr>
            <td class="no">1.</td>
            <td class="nama">{{ $pihak1Nama }}</td>
            <td class="sep">:</td>
            <td>{{ $gantiPj ? 'Penanggung Jawab Barang Lama pada Ruangan' : 'Penanggung Jawab Ruangan' }} {{ $ruanganAsal }}, selanjutnya disebut <strong>PIHAK PERTAMA.</strong></td>
        </tr>
        <tr><td colspan="4" style="height: 3mm;"></td></tr>
        <tr>
            <td class="no">2.</td>
            <td class="nama">{{ $pihak2Nama }}</td>
            <td class="sep">:</td>
            <td>{{ $gantiPj ? 'Penanggung Jawab Barang Baru pada Ruangan' : 'Penanggung Jawab Ruangan' }} {{ $ruanganTujuan }}, selanjutnya disebut <strong>PIHAK KEDUA.</strong></td>
        </tr>
    </table>

    <p class="p-indent">Kedua BELAH PIHAK berkesepakatan untuk mengadakan serah terima barang-barang Inventaris Milik Pemerintah Kabupaten {{ $kabupaten }} dengan ketentuan sebagai berikut :</p>

    <!-- PASAL 1 -->
    <p class="pasal">Pasal 1</p>

    <p class="p-indent">PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA sebagaimana PIHAK KEDUA menerima penyerahan dari PIHAK PERTAMA, berupa @if($gantiPj)tanggung jawab atas barang inventaris pada Ruangan {{ $ruanganAsal }}@else barang inventaris yang digeser dari Ruangan {{ $ruanganAsal }} ke Ruangan {{ $ruanganTujuan }}@endif dengan rincian sebagai berikut :</p>

    <table class="barang">
        <thead>
            <tr>
                <th style="width: 10mm;">No.</th>
                <th>Nama Barang</th>
                <th style="width: 38mm;">Kode Barang</th>
                <th style="width: 20mm;">No. Register</th>
                <th style="width: 35mm;">Merk/Type</th>
                <th style="width: 16mm;">Tahun</th>
            </tr>
        </thead>
        <tbody>
            @foreach($barang as $i => $b)
            <tr>
                <td class="center">{{ $i + 1 }}</td>
                <td>{{ $b['nama_barang'] }}</td>
                <td>{{ $b['kode_barang'] }}</td>
                <td class="center">{{ $b['nomor_register'] }}</td>
                <td>{{ $b['merk'] }}</td>
                <td class="center">{{ $b['tahun'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($keterangan)
    <p class="p-indent">Keterangan : {{ $keterangan }}</p>
    @endif

    <!-- PASAL 2 -->
    <p class="pasal">Pasal 2</p>

    @if($gantiPj)
    <p class="p-indent">Sejak tanggal serah terima ini, barang inventaris tersebut pada pasal 1 tetap tercatat pada Kartu Inventaris Ruangan {{ $ruanganTujuan }}, sedangkan penggunaan serta pemeliharaannya menjadi tanggung jawab PIHAK KEDUA.</p>
    @else
    <p class="p-indent">Sejak tanggal serah terima ini, barang inventaris tersebut pada pasal 1 tercatat pada Kartu Inventaris Ruangan {{ $ruanganTujuan }} dan penggunaan serta pemeliharaannya menjadi tanggung jawab PIHAK KEDUA.</p>
    @endif

    <!-- PASAL 3 -->
    <p class="pasal">Pasal 3</p>

    <table class="pasal3-table">
        <tr>
            <td class="num">(1)</td>
            <td>Status kepemilikan barang tersebut adalah Milik Pemerintah Kabupaten {{ $kabupaten }} sesuai Peraturan Pemerintah Nomor 27 Tahun 2014 tentang Pengolahan Barang Milik Negara/Daerah dan Peraturan Menteri Dalam Negeri Nomor 19 Tahun 2016 tentang Pedoman Teknis Pengolah Barang Milik Daerah.</td>
        </tr>
        <tr><td colspan="2" style="height: 2mm;"></td></tr>
        <tr>
            <td class="num">(2)</td>
            <td>Dengan pertimbangan tertentu, sewaktu-waktu barang inventaris tersebut dapat digeser kembali dengan Berita Acara Serah Terima yang baru.</td>
        </tr>
    </table>

    <p class="p-indent">Demikian Berita Acara Serah Terima ini dibuat dalam rangkap 3 (tiga) untuk dipergunakan sebagaimana mestinya.</p>

    <!-- TTD -->
    <table style="width: 100%; margin-top: 8mm; line-height: 1.2;">
        <tr>
            <td style="width: 50%; vertical-align: top;">
                <table style="border-collapse: collapse;">
                    <tr><td style="text-align: left; padding: 0;">&nbsp;</td></tr>
                    <tr><td style="text-align: left; padding: 0;">PIHAK KEDUA</td></tr>
                    <tr><td style="height: 28mm; padding: 0;"></td></tr>
                    <tr><td style="text-align: left; padding: 0; white-space: nowrap;">
                        <span class="ttd-name">{{ $pihak2Nama }}</span><br>
                        @if($pihak2Nip)
                        <span class="ttd-nip">NIP. {{ $pihak2Nip }}</span>
                        @endif
                    </td></tr>
                </table>
            </td>
            <td style="width: 50%; vertical-align: top;">
                <table align="right" style="border-collapse: collapse;">
                    <tr><td style="text-align: left; padding: 0;">{{ $settings['ttd_kota'] ?: 'Cilacap' }}, {{ $tanggalFormatted }}</td></tr>
                    <tr><td style="text-align: left; padding: 0;">PIHAK PERTAMA</td></tr>
                    <tr><td style="height: 28mm; padding: 0;"></td></tr>
                    <tr><td style="text-align: left; padding: 0; white-space: nowrap;">
                        <span class="ttd-name">{{ $pihak1Nama }}</span><br>
                        @if($pihak1Nip)
                        <span class="ttd-nip">NIP. {{ $pihak1Nip }}</span>
                        @endif
                    </td></tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
