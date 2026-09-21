<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $kibLabel }}</title>
    @include('exports._styles')
    <style>
        .footer-col { width: 50%; }
        .info-section .kode-lokasi td { padding-top: 2mm; }
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
                <tr class="kode-lokasi">
                    <td class="label">NO. KODE LOKASI</td>
                    <td class="separator">:</td>
                    <td>{{ $settings['instansi_kode_lokasi'] }}</td>
                </tr>
            </table>
        </div>

        @yield('table')

        <div class="footer">
            <div class="footer-row">
                <div class="footer-col">
                    <p>MENGETAHUI</p>
                    <p>KEPALA DINAS</p>
                    <div class="ttd-space"></div>
                    <p class="ttd-name{{ $settings['ttd_kepala_nama'] ? '' : ' ttd-empty' }}">{!! $settings['ttd_kepala_nama'] ? e($settings['ttd_kepala_nama']) : '&nbsp;' !!}</p>
                    <p class="ttd-nip">{!! $settings['ttd_kepala_nip'] ? 'NIP. '.e($settings['ttd_kepala_nip']) : '&nbsp;' !!}</p>
                </div>
                <div class="footer-col">
                    <p>{{ $settings['ttd_kota'] ?: '............' }}, {{ $tanggal }}</p>
                    <p>PETUGAS PENGURUS BARANG</p>
                    <div class="ttd-space"></div>
                    <p class="ttd-name{{ $settings['ttd_pengurus_nama'] ? '' : ' ttd-empty' }}">{!! $settings['ttd_pengurus_nama'] ? e($settings['ttd_pengurus_nama']) : '&nbsp;' !!}</p>
                    <p class="ttd-nip">{!! $settings['ttd_pengurus_nip'] ? 'NIP. '.e($settings['ttd_pengurus_nip']) : '&nbsp;' !!}</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
