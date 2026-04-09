@extends('exports._layout')

@section('styles')
<style>
    table.data th.group { background-color: #d0d0d0; }
</style>
@endsection

@section('table')
<table class="data">
    <thead>
        <tr>
            <th rowspan="2" style="width:25px">No.</th>
            <th rowspan="2">Jenis Barang /<br>Nama Barang</th>
            <th rowspan="2">Kode Barang<br>1.3.</th>
            <th rowspan="2">Nomor<br>Register</th>
            <th colspan="2" class="group">Buku / Perpustakaan</th>
            <th colspan="3" class="group">Barang Bercorak Kesenian /<br>Kebudayaan</th>
            <th colspan="2" class="group">Hewan/Ternak dan<br>Tumbuhan</th>
            <th rowspan="2">Jumlah</th>
            <th rowspan="2">Asal<br>usul</th>
            <th rowspan="2">Tahun Cetak /<br>Pembelian</th>
            <th rowspan="2">Harga<br>(ribuan Rp)</th>
            <th rowspan="2">Keterangan</th>
        </tr>
        <tr>
            <th>Judul /<br>Pencipta</th>
            <th>Spesifikasi</th>
            <th>Asal Daerah</th>
            <th>Pencipta</th>
            <th>Bahan</th>
            <th>Jenis</th>
            <th>Ukuran</th>
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
            @php $d = $asset->kibEDetail; @endphp
            <tr>
                <td class="center">{{ $i + 1 }}</td>
                <td>{{ $asset->nama_barang }}</td>
                <td>{{ $asset->kode_barang }}</td>
                <td>{{ $asset->nomor_register }}</td>
                <td>{{ $d?->judul_pencipta ?? '-' }}</td>
                <td>{{ $d?->spesifikasi ?? '-' }}</td>
                <td>{{ $d?->asal_daerah ?? '-' }}</td>
                <td>{{ $d?->pencipta ?? '-' }}</td>
                <td>{{ $d?->bahan ?? '-' }}</td>
                <td>{{ $d?->jenis ?? '-' }}</td>
                <td>{{ $d?->ukuran ?? '-' }}</td>
                <td class="center">{{ $d?->jumlah ?? '-' }}</td>
                <td>{{ $asset->asal_usul }}</td>
                <td class="center">{{ $d?->tahun_cetak ?? '-' }}</td>
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
