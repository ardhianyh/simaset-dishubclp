@extends('exports._layout')

@section('table')
<table class="data">
    <thead>
        <tr>
            <th rowspan="3" style="width:25px">No.</th>
            <th rowspan="3">Jenis Barang /<br>Nama Barang</th>
            <th colspan="2">N o m o r</th>
            <th rowspan="3">Luas<br>(M2)</th>
            <th rowspan="3">Tahun<br>Penga-<br>daan</th>
            <th rowspan="3">Letak/<br>Alamat</th>
            <th colspan="3">Status Tanah</th>
            <th rowspan="3">Penggunaan</th>
            <th rowspan="3">Asal<br>usul</th>
            <th rowspan="3">Harga<br>(ribuan Rp)</th>
            <th rowspan="3">Keterangan</th>
        </tr>
        <tr>
            <th rowspan="2">Kode Barang<br>1.3.</th>
            <th rowspan="2">Regis-<br>ter</th>
            <th rowspan="2">Hak</th>
            <th colspan="2">Sertifikat</th>
        </tr>
        <tr>
            <th>Tanggal</th>
            <th>Nomor</th>
        </tr>
        <tr class="kolom-nomor">
            <td>1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td>5</td>
            <td>6</td>
            <td>7</td>
            <td>8</td>
            <td>9</td>
            <td>10</td>
            <td>11</td>
            <td>12</td>
            <td>13</td>
            <td>14</td>
        </tr>
    </thead>
    <tbody>
        @forelse($assets as $i => $asset)
            @php $d = $asset->kibADetail; @endphp
            <tr>
                <td class="center">{{ $i + 1 }}</td>
                <td>{{ $asset->nama_barang }}</td>
                <td>{{ $asset->kode_barang }}</td>
                <td>{{ $asset->nomor_register }}</td>
                <td class="number">{{ $d?->luas_m2 ? number_format($d->luas_m2, 2, ',', '.') : '-' }}</td>
                <td class="center">{{ $d?->tahun_pengadaan ?? '-' }}</td>
                <td>{{ $d?->alamat ?? '-' }}</td>
                <td>{{ $d?->hak_tanah ?? '-' }}</td>
                <td class="center">{{ $d?->sertifikat_tanggal ? \Carbon\Carbon::parse($d->sertifikat_tanggal)->format('d/m/Y') : '-' }}</td>
                <td>{{ $d?->sertifikat_nomor ?? '-' }}</td>
                <td>{{ $d?->penggunaan ?? '-' }}</td>
                <td>{{ $asset->asal_usul }}</td>
                <td class="number">{{ number_format($asset->harga, 2, ',', '.') }}</td>
                <td>{{ $asset->keterangan ?? '-' }}</td>
            </tr>
        @empty
            <tr><td colspan="14" style="text-align:center">Tidak ada data</td></tr>
        @endforelse
    </tbody>
    <tfoot>
        <tr>
            <td colspan="12" style="text-align:right; font-weight:bold;">Jumlah Harga</td>
            <td class="number">{{ number_format($totalHarga, 2, ',', '.') }}</td>
            <td></td>
        </tr>
    </tfoot>
</table>
@endsection
