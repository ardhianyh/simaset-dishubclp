@extends('exports._layout')

@section('table')
<table class="data">
    <thead>
        <tr>
            <th rowspan="2" style="width:25px">No.</th>
            <th rowspan="2">Jenis Barang /<br>Nama Barang</th>
            <th rowspan="2">Kode Barang<br>1.3.</th>
            <th rowspan="2">Nomor<br>Register</th>
            <th rowspan="2">Merk/<br>Type</th>
            <th rowspan="2">Ukuran/<br>CC</th>
            <th rowspan="2">Bahan</th>
            <th rowspan="2">Tahun<br>Pem-<br>belian</th>
            <th colspan="5">N o m o r</th>
            <th rowspan="2">Asal<br>usul</th>
            <th rowspan="2">Harga<br>(ribuan Rp)</th>
            <th rowspan="2">Keterangan</th>
        </tr>
        <tr>
            <th>Pabrik</th>
            <th>Rangka</th>
            <th>Mesin</th>
            <th>Polisi</th>
            <th>BPKB</th>
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
            <td>15</td>
            <td>16</td>
        </tr>
    </thead>
    <tbody>
        @forelse($assets as $i => $asset)
            @php $d = $asset->kibBDetail; @endphp
            <tr>
                <td class="center">{{ $i + 1 }}</td>
                <td>{{ $asset->nama_barang }}</td>
                <td>{{ $asset->kode_barang }}</td>
                <td>{{ $asset->nomor_register }}</td>
                <td>{{ $d?->merk_type ?? '-' }}</td>
                <td>{{ $d?->ukuran_cc ?? '-' }}</td>
                <td>{{ $d?->bahan ?? '-' }}</td>
                <td class="center">{{ $d?->tahun_pembelian ?? '-' }}</td>
                <td>{{ $d?->nomor_pabrik ?? '-' }}</td>
                <td>{{ $d?->nomor_rangka ?? '-' }}</td>
                <td>{{ $d?->nomor_mesin ?? '-' }}</td>
                <td>{{ $d?->nomor_polisi ?? '-' }}</td>
                <td>{{ $d?->nomor_bpkb ?? '-' }}</td>
                <td>{{ $asset->asal_usul }}</td>
                <td class="number">{{ number_format($asset->harga, 2, ',', '.') }}</td>
                <td>{{ $asset->keterangan ?? '-' }}</td>
            </tr>
        @empty
            <tr><td colspan="16" style="text-align:center">Tidak ada data</td></tr>
        @endforelse
    </tbody>
    <tfoot>
        <tr>
            <td colspan="14" style="text-align:right; font-weight:bold;">Jumlah Harga</td>
            <td class="number">{{ number_format($totalHarga, 2, ',', '.') }}</td>
            <td></td>
        </tr>
    </tfoot>
</table>
@endsection
