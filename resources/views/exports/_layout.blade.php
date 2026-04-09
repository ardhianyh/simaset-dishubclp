<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $kibLabel }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 9pt; color: #000; }
        .page { padding: 10mm 8mm; }

        .header-wrapper { margin-bottom: 4mm; min-height: 22mm; position: relative; }
        .header-logo { position: absolute; top: 0; left: 0; width: 18mm; height: auto; }
        .info-section { padding-left: 22mm; }
        .header { text-align: center; }
        .header h2 { font-size: 11pt; font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; }
        .header h3 { font-size: 11pt; font-weight: bold; text-transform: uppercase; margin-bottom: 1mm; }
        .header h4 { font-size: 11pt; font-weight: bold; text-transform: uppercase; margin-bottom: 3mm; }

        .info-section { margin-bottom: 4mm; font-size: 9pt; }
        .info-section table { border-collapse: collapse; }
        .info-section td { padding: 0.5px 2px; vertical-align: top; }
        .info-section .label { font-weight: bold; white-space: nowrap; }
        .info-section .separator { width: 10px; text-align: center; }

        table.data { width: 100%; border-collapse: collapse; margin-bottom: 4mm; font-size: 7.5pt; }
        table.data th, table.data td { border: 1px solid #000; padding: 2px 3px; vertical-align: top; }
        table.data th { background-color: #e8e8e8; font-weight: bold; text-align: center; font-size: 7pt; }
        table.data td.number { text-align: right; font-family: 'Courier New', monospace; }
        table.data td.center { text-align: center; }
        table.data tfoot td { font-weight: bold; }
        table.data tr.kolom-nomor td { text-align: center; font-weight: bold; font-size: 7pt; background-color: #f0f0f0; }

        .footer { margin-top: 6mm; }
        .footer-row { display: table; width: 100%; }
        .footer-left, .footer-right { display: table-cell; width: 50%; vertical-align: top; }
        .footer-right { text-align: center; }
        .footer-left { text-align: center; }
        .ttd-space { height: 25mm; }
        .ttd-name { font-weight: bold; text-decoration: underline; }
        .ttd-nip { font-size: 8pt; }
    </style>
    @yield('styles')
</head>
<body>
    <div class="page">
        <div class="header-wrapper">
            @if(!empty($logoBase64))
                <img src="{{ $logoBase64 }}" class="header-logo" />
            @endif
            <div class="header">
                <h2>{{ $settings['instansi_nama'] ?: 'PEMERINTAH KABUPATEN ...' }}</h2>
                <h3>REKAPITULASI KARTU INVENTARIS BARANG (KIB) {{ $kibType }}</h3>
                <h4>{{ $kibSubtitle }}</h4>
            </div>
        </div>

        <div class="info-section">
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
                    <td class="label">NO. KODE LOKASI</td>
                    <td class="separator">:</td>
                    <td>{{ $settings['instansi_kode_lokasi'] }}</td>
                </tr>
            </table>
        </div>

        @yield('table')

        <div class="footer">
            <div class="footer-row">
                <div class="footer-left">
                    <p>MENGETAHUI</p>
                    <p>KEPALA DINAS</p>
                    <div class="ttd-space"></div>
                    <p class="ttd-name">{{ $settings['ttd_kepala_nama'] }}</p>
                    <p class="ttd-nip">NIP. {{ $settings['ttd_kepala_nip'] }}</p>
                </div>
                <div class="footer-right">
                    <p>{{ $settings['ttd_kota'] ?: '............' }}, {{ $tanggal }}</p>
                    <p>PETUGAS PENGURUS BARANG</p>
                    <div class="ttd-space"></div>
                    <p class="ttd-name">{{ $settings['ttd_pengurus_nama'] }}</p>
                    <p class="ttd-nip">NIP. {{ $settings['ttd_pengurus_nip'] }}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
