<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'instansi_nama' => 'PEMERINTAH KABUPATEN CILACAP',
            'instansi_provinsi' => 'PROVINSI JAWA TENGAH',
            'instansi_kabkota' => 'PEMERINTAH KABUPATEN CILACAP',
            'instansi_bidang' => 'Bidang Perhubungan',
            'instansi_unit' => 'Dinas Perhubungan',
            'instansi_sub_unit' => 'Dinas Perhubungan',
            'instansi_kode_lokasi' => '12.11.12.06.02.01.00',
            'ttd_kepala_nama' => '',
            'ttd_kepala_nip' => '',
            'ttd_pengurus_nama' => '',
            'ttd_pengurus_nip' => '',
            'ttd_kota' => 'Cilacap',
            'instansi_alamat' => 'Jalan MT. Haryono Nomor 29, Tegalreja, Cilacap Selatan, Cilacap, Jawa Tengah 53213',
            'instansi_telepon' => '(0282) 534725',
            'instansi_fax' => '(0282) 521881',
            'instansi_website' => 'www.dishub.cilacapkab.go.id',
            'instansi_email' => 'dishub@cilacapkab.go.id',
        ];

        foreach ($defaults as $key => $value) {
            Setting::set($key, $value);
        }
    }
}
