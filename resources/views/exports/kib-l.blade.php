@extends('exports._layout')

@section('table')
<table class="data">
    <thead>
        <tr>
            <th rowspan="2" style="width:25px">No.</th>
            <th rowspan="2">Jenis Barang /<br>Nama Barang</th>
            <th colspan="2">N o m o r</th>
            <th rowspan="2">Tahun<br>Pengadaan</th>
            <th rowspan="2">Judul / Nama</th>
            <th rowspan="2">Pencipta</th>
            <th rowspan="2">Spesifikasi</th>
            <th rowspan="2">Kondisi</th>
            <th rowspan="2">Asal<br>usul</th>
            <th rowspan="2">Harga</th>
            <th rowspan="2">Keterangan</th>
        </tr>
        <tr>
            <th>Kode Barang<br>1.5.</th>
            <th>Regis-<br>ter</th>
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
        </tr>
    </thead>
    <tbody>
        @forelse($assets as $i => $asset)
            @php $d = $asset->kibLDetail; @endphp
            <tr>
                <td class="center">{{ $i + 1 }}</td>
                <td>{{ $asset->nama_barang }}</td>
                <td>{{ $asset->kode_barang }}</td>
                <td>{{ $asset->nomor_register }}</td>
                <td class="center">{{ $d?->tahun_pengadaan ?? '-' }}</td>
                <td>{{ $d?->judul_nama ?? '-' }}</td>
                <td>{{ $d?->pencipta ?? '-' }}</td>
                <td>{{ $d?->spesifikasi ?? '-' }}</td>
                <td>{{ $d?->kondisi ?? '-' }}</td>
                <td>{{ $asset->asal_usul }}</td>
                <td class="number">{{ number_format($asset->harga, 0, ',', '.') }}</td>
                <td>{{ $asset->keterangan ?? '-' }}</td>
            </tr>
        @empty
            <tr><td colspan="12" style="text-align:center">Tidak ada data</td></tr>
        @endforelse
    </tbody>
    <tfoot>
        <tr>
            <td colspan="10" style="text-align:right; font-weight:bold;">Jumlah Harga</td>
            <td class="number">{{ number_format($totalHarga, 0, ',', '.') }}</td>
            <td></td>
        </tr>
    </tfoot>
</table>
@endsection
