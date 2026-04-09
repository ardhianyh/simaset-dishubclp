@extends('exports._layout')

@section('table')
<table class="data">
    <thead>
        <tr>
            <th rowspan="3" style="width:25px">No.</th>
            <th rowspan="3">Jenis Barang /<br>Nama Barang</th>
            <th colspan="2">N o m o r</th>
            <th rowspan="3">Kondisi<br>Bangunan<br>(B,KB,RB)</th>
            <th colspan="2">Konstruksi Bangunan</th>
            <th rowspan="3">Luas<br>Lantai<br>(M2)</th>
            <th rowspan="3">Letak/Lokasi<br>Alamat</th>
            <th colspan="2">Dokumen Gedung</th>
            <th rowspan="3">Luas<br>Tanah<br>(M2)</th>
            <th rowspan="3">Status<br>Tanah</th>
            <th rowspan="3">Nomor<br>Kode<br>Tanah</th>
            <th rowspan="3">Asal<br>usul</th>
            <th rowspan="3">Harga<br>(ribuan Rp)</th>
            <th rowspan="3">Keterangan</th>
        </tr>
        <tr>
            <th rowspan="2">Kode Barang<br>1.3.</th>
            <th rowspan="2">Regis-<br>ter</th>
            <th rowspan="2">Bertingkat/<br>Tidak</th>
            <th rowspan="2">Beton/<br>Tidak</th>
            <th rowspan="2">Tanggal</th>
            <th rowspan="2">Nomor</th>
        </tr>
        <tr></tr>
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
            <td>17</td>
        </tr>
    </thead>
    <tbody>
        @forelse($assets as $i => $asset)
            @php $d = $asset->kibCDetail; @endphp
            <tr>
                <td class="center">{{ $i + 1 }}</td>
                <td>{{ $asset->nama_barang }}</td>
                <td>{{ $asset->kode_barang }}</td>
                <td>{{ $asset->nomor_register }}</td>
                <td class="center">{{ $d?->kondisi ? str_replace(['Baik', 'Kurang Baik', 'Rusak Berat'], ['B', 'KB', 'RB'], $d->kondisi) : '-' }}</td>
                <td class="center">{{ $d?->bertingkat ? 'Ya' : 'Tidak' }}</td>
                <td class="center">{{ $d?->beton ? 'Ya' : 'Tidak' }}</td>
                <td class="number">{{ $d?->luas_lantai_m2 ? number_format($d->luas_lantai_m2, 2, ',', '.') : '-' }}</td>
                <td>{{ $d?->alamat ?? '-' }}</td>
                <td class="center">{{ $d?->dokumen_tanggal ? \Carbon\Carbon::parse($d->dokumen_tanggal)->format('d/m/Y') : '-' }}</td>
                <td>{{ $d?->dokumen_nomor ?? '-' }}</td>
                <td class="number">-</td>
                <td>{{ $d?->status_tanah ?? '-' }}</td>
                <td>{{ $d?->nomor_kode_tanah ?? '-' }}</td>
                <td>{{ $asset->asal_usul }}</td>
                <td class="number">{{ number_format($asset->harga, 2, ',', '.') }}</td>
                <td>{{ $asset->keterangan ?? '-' }}</td>
            </tr>
        @empty
            <tr><td colspan="17" style="text-align:center">Tidak ada data</td></tr>
        @endforelse
    </tbody>
    <tfoot>
        <tr>
            <td colspan="15" style="text-align:right; font-weight:bold;">Jumlah Harga</td>
            <td class="number">{{ number_format($totalHarga, 2, ',', '.') }}</td>
            <td></td>
        </tr>
    </tfoot>
</table>
@endsection
