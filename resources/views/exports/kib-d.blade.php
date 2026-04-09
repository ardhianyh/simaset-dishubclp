@extends('exports._layout')

@section('table')
<table class="data">
    <thead>
        <tr>
            <th rowspan="2" style="width:25px">No.</th>
            <th rowspan="2">Jenis Barang /<br>Nama Barang</th>
            <th colspan="2">N o m o r</th>
            <th rowspan="2">Konstruksi</th>
            <th rowspan="2">Panjang<br>(Km)</th>
            <th rowspan="2">Lebar<br>(M)</th>
            <th rowspan="2">Luas<br>(M2)</th>
            <th rowspan="2">Letak/Lokasi<br>Alamat</th>
            <th colspan="2">Dokumen</th>
            <th rowspan="2">Status<br>Tanah</th>
            <th rowspan="2">Nomor<br>Kode<br>Tanah</th>
            <th rowspan="2">Asal<br>usul</th>
            <th rowspan="2">Harga<br>(ribuan Rp)</th>
            <th rowspan="2">Kondisi<br>(B, KB, RB)</th>
            <th rowspan="2">Keterangan</th>
        </tr>
        <tr>
            <th>Kode Barang<br>1.3.</th>
            <th>Regis-<br>ter</th>
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
            <td>15</td>
            <td>16</td>
            <td>17</td>
        </tr>
    </thead>
    <tbody>
        @forelse($assets as $i => $asset)
            @php $d = $asset->kibDDetail; @endphp
            <tr>
                <td class="center">{{ $i + 1 }}</td>
                <td>{{ $asset->nama_barang }}</td>
                <td>{{ $asset->kode_barang }}</td>
                <td>{{ $asset->nomor_register }}</td>
                <td>{{ $d?->konstruksi ?? '-' }}</td>
                <td class="number">{{ $d?->panjang_km ? number_format($d->panjang_km, 3, ',', '.') : '-' }}</td>
                <td class="number">{{ $d?->lebar_m ? number_format($d->lebar_m, 3, ',', '.') : '-' }}</td>
                <td class="number">{{ $d?->luas_m2 ? number_format($d->luas_m2, 2, ',', '.') : '-' }}</td>
                <td>{{ $d?->alamat ?? '-' }}</td>
                <td class="center">{{ $d?->dokumen_tanggal ? \Carbon\Carbon::parse($d->dokumen_tanggal)->format('d/m/Y') : '-' }}</td>
                <td>{{ $d?->dokumen_nomor ?? '-' }}</td>
                <td>{{ $d?->status_tanah ?? '-' }}</td>
                <td>{{ $d?->nomor_kode_tanah ?? '-' }}</td>
                <td>{{ $asset->asal_usul }}</td>
                <td class="number">{{ number_format($asset->harga, 2, ',', '.') }}</td>
                <td class="center">{{ $d?->kondisi ? str_replace(['Baik', 'Kurang Baik', 'Rusak Berat'], ['B', 'KB', 'RB'], $d->kondisi) : '-' }}</td>
                <td>{{ $asset->keterangan ?? '-' }}</td>
            </tr>
        @empty
            <tr><td colspan="17" style="text-align:center">Tidak ada data</td></tr>
        @endforelse
    </tbody>
    <tfoot>
        <tr>
            <td colspan="14" style="text-align:right; font-weight:bold;">Jumlah Harga</td>
            <td class="number">{{ number_format($totalHarga, 2, ',', '.') }}</td>
            <td colspan="2"></td>
        </tr>
    </tfoot>
</table>
@endsection
