<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>BAST - {{ $asset->nama_barang }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
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

        .rincian-table { margin: 3mm 0 3mm 8mm; border-collapse: collapse; }
        .rincian-table td { padding: 1px 4px; vertical-align: top; }
        .rincian-table .label { width: 38mm; white-space: nowrap; }
        .rincian-table .sep { width: 8mm; text-align: center; }

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
        <h3>BERITA ACARA SERAH TERIMA BARANG-BARANG INVENTARIS<br>MILIK PEMERINTAH KABUPATEN {{ strtoupper($kabupaten) }}</h3>
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
            <td>{{ $pihak1Jabatan }} selaku {{ $pihak1Peran }} Milik Daerah, selanjutnya disebut <strong>PIHAK PERTAMA.</strong></td>
        </tr>
        <tr><td colspan="4" style="height: 3mm;"></td></tr>
        <tr>
            <td class="no">2.</td>
            <td class="nama">{{ $pihak2Nama }}</td>
            <td class="sep">:</td>
            <td>{{ $pihak2Jabatan }} selanjutnya disebut <strong>PIHAK KEDUA.</strong></td>
        </tr>
    </table>

    <p class="p-indent">Kedua BELAH PIHAK berkesepakatan untuk mengadakan serah terima barang-barang Inventaris Milik Pemerintah Kabupaten {{ $kabupaten }} dengan ketentuan sebagai berikut :</p>

    <!-- PASAL 1 -->
    <p class="pasal">Pasal 1</p>

    <p class="p-indent">PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA sebagaimana PIHAK KEDUA menerima penyerahan dari PIHAK PERTAMA dengan rincian barang sebagai berikut :</p>

    <table class="rincian-table">
        @foreach($rincianBarang as $label => $value)
        <tr>
            <td class="label">{{ $label }}</td>
            <td class="sep">:</td>
            <td>{{ $value }}</td>
        </tr>
        @endforeach
    </table>

    <!-- PASAL 2 -->
    <p class="pasal">Pasal 2</p>

    <p class="p-indent">Penyerahan barang inventaris tersebut pada pasal 1 sebagai bentuk pertanggungjawaban atas penggunaan {{ $jenisBarang }} Oleh PIHAK KEDUA dalam menunjang tugas-tugas kedinasan.</p>

    <!-- PASAL 3 -->
    <p class="pasal">Pasal 3</p>

    <table class="pasal3-table">
        <tr>
            <td class="num">(1)</td>
            <td>Status kepemilikan barang tersebut adalah Milik Pemerintah Kabupaten {{ $kabupaten }} sesuai Peraturan Pemerintah Nomor 27 Tahun 2014 tentang Pengolahan Barang Milik Negara/Daerah dan Peraturan Menteri Dalam Negeri Nomor 19 Tahun 2016 tentang Pedoman Teknis Pengolah Barang Milik Daerah, sedangkan pemanfaatan, Pemeliharaan dan penggunaannya menjadi tanggungjawab kepada PIHAK KEDUA sejak tanggal serah terima ini.</td>
        </tr>
        <tr><td colspan="2" style="height: 2mm;"></td></tr>
        <tr>
            <td class="num">(2)</td>
            <td>Dengan pertimbangan tertentu, sewaktu-waktu pihak PERTAMA berhak menarik Barang Inventaris tersebut dan PIHAK KEDUA berkewajiban menyerahkannya kembali.</td>
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
                    <tr><td style="text-align: left; padding: 0;">
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
                    <tr><td style="text-align: left; padding: 0;">
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
