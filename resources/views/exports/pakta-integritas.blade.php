<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pakta Integritas - {{ $asset->nama_barang }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; line-height: 1.5; }
        p { margin-bottom: 3mm; text-align: justify; }
        ol { margin: 2mm 0; padding-left: 6mm; }
        ol li { margin-bottom: 2mm; text-align: justify; }
    </style>
</head>
<body>

<!-- KOP SURAT -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 0;">
    <tr>
        @if($logoBase64)
        <td width="27mm" valign="middle" align="left">
            <img src="{{ $logoBase64 }}" style="width: 25mm; height: auto;" />
        </td>
        @endif
        <td valign="middle" align="center" style="padding-left: 3mm;">
            <div style="font-size: 14pt; font-weight: normal; text-transform: uppercase; letter-spacing: 1px; line-height: 1.3;">{{ $settings['instansi_nama'] ?: 'PEMERINTAH KABUPATEN CILACAP' }}</div>
            <div style="font-size: 22pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; line-height: 1.2;">{{ $settings['instansi_unit'] ?: 'DINAS PERHUBUNGAN' }}</div>
            <div style="font-size: 9pt; margin-top: 2mm; line-height: 1.4;">
                {{ $settings['instansi_alamat'] ?: 'Jalan MT. Haryono Nomor 29, Tegalreja, Cilacap Selatan, Cilacap, Jawa Tengah 53213' }},<br>
                Telepon {{ $settings['instansi_telepon'] ?: '(0282) 534725' }}, Faksimile {{ $settings['instansi_fax'] ?: '(0282) 521881' }},<br>
                Laman : {{ $settings['instansi_website'] ?: 'www.dishub.cilacapkab.go.id' }}, Pos-el : {{ $settings['instansi_email'] ?: 'dishub@cilacapkab.go.id' }}
            </div>
        </td>
    </tr>
</table>
<div style="border-bottom: 3px double #000; margin-top: 4mm; margin-bottom: 5mm;"></div>

<!-- JUDUL -->
<p style="text-align: center; margin: 6mm 0;"><strong><u>PAKTA INTEGRITAS</u></strong></p>

<!-- KONTEN -->
<p>Saya yang bertanda tangan di bawah ini :</p>

<table cellpadding="1" cellspacing="0" style="margin: 2mm 0;">
    <tr>
        <td style="width: 35mm; white-space: nowrap;">Nama</td>
        <td style="width: 8mm; text-align: center;">:</td>
        <td>{{ $nama }}</td>
    </tr>
    <tr>
        <td style="width: 35mm; white-space: nowrap; vertical-align: top;">Jabatan</td>
        <td style="width: 8mm; text-align: center; vertical-align: top;">:</td>
        <td>{{ $jabatan }}</td>
    </tr>
</table>

<p>Dalam rangka penggunaan fasilitas barang milik daerah (BMD) yang saya gunakan berupa kendaraan dinas roda dua dengan spesifikasi sebagai berikut :</p>

<table cellpadding="1" cellspacing="0" style="margin: 2mm 0;">
    @foreach($spesifikasi as $label => $value)
    <tr>
        <td style="width: 40mm; white-space: nowrap; vertical-align: top;">{{ $label }}</td>
        <td style="width: 8mm; text-align: center; vertical-align: top;">:</td>
        <td>{{ $value }}</td>
    </tr>
    @endforeach
</table>

<p>menyatakan bahwa saya :</p>

<ol>
    <li>Akan menggunakan dan memanfaatkan kendaraan dinas roda dua tersebut sesuai dengan peruntukannya guna menunjang tugas kedinasan/tugas pokok dan fungsi;</li>
    <li>Akan memelihara, merawat dan menjaga dengan baik kendaraan dinas roda dua tersebut sebagaimana lazimnya;</li>
    <li>Biaya pemeliharaan/perawatan kendaraan dinas roda dua tersebut akibat kerusakan yang timbul karena penggunaan dalam urusan dinas dibebankan pada APBD Kabupaten {{ $kabupaten }}, dan apabila kerusakan karena penggunaan diluar urusan dinas menjadi tanggungjawab saya;</li>
    <li>Tidak akan memindatangankan penggunaannya kepada pihak lain tanpa persetujuan Pengelola/Pengguna/Kuasa Pengguna Barang;</li>
    <li>Tidak akan mengubah status hukum kendaraan dinas roda dua tersebut baik dengan imbalan (ganti kerugian) atau hibah kepada orang lain atau pihak manapun juga;</li>
    <li>Apabila kendaraan dinas roda dua tersebut hilang, maka bersedia untuk mengganti sesuai ketentuan yang berlaku;</li>
    <li>Menyerahkan kembali kendaraan dinas roda dua tersebut apabila saya dimutasi/dipindahtugaskan ke dinas/instansi lain.</li>
    <li>Apabila saya melanggar hal-hal yang telah saya nyatakan dalam Pakta Integritas ini, saya bersedia dikenakan sanksi sesuai ketentuan peraturan perundang-undangan yang berlaku.</li>
</ol>

<p>Demikian surat penunjukan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>

<!-- TTD -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 10mm;">
    <tr>
        <td width="50%"></td>
        <td width="50%" align="center">
            <p style="text-align: center; margin: 0;">{{ $settings['ttd_kota'] ?: 'Cilacap' }}, {{ $tanggal }}</p>
            <p style="text-align: center; margin: 0 0 2mm 0;">Yang Menyatakan,</p>
        </td>
    </tr>
    <tr>
        <td width="50%" style="height: 30mm;"></td>
        <td width="50%" style="height: 30mm;"></td>
    </tr>
    <tr>
        <td width="50%"></td>
        <td width="50%" align="center">
            <p style="text-align: center; margin: 0; font-weight: bold; text-decoration: underline;">{{ $nama }}</p>
            @if($nip)
            <p style="text-align: center; margin: 0;">NIP. {{ $nip }}</p>
            @endif
        </td>
    </tr>
</table>

</body>
</html>
