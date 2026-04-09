<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    private const SETTING_KEYS = [
        'instansi_nama',
        'instansi_provinsi',
        'instansi_kabkota',
        'instansi_bidang',
        'instansi_unit',
        'instansi_sub_unit',
        'instansi_kode_lokasi',
        'instansi_alamat',
        'instansi_telepon',
        'instansi_fax',
        'instansi_website',
        'instansi_email',
        'ttd_kepala_nama',
        'ttd_kepala_nip',
        'ttd_pengurus_nama',
        'ttd_pengurus_nip',
        'ttd_kota',
    ];

    public function edit()
    {
        $settings = [];
        foreach (self::SETTING_KEYS as $key) {
            $settings[$key] = Setting::get($key, '');
        }

        return Inertia::render('Settings/Edit', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'instansi_nama' => ['nullable', 'string', 'max:255'],
            'instansi_provinsi' => ['nullable', 'string', 'max:255'],
            'instansi_kabkota' => ['nullable', 'string', 'max:255'],
            'instansi_bidang' => ['nullable', 'string', 'max:255'],
            'instansi_unit' => ['nullable', 'string', 'max:255'],
            'instansi_sub_unit' => ['nullable', 'string', 'max:255'],
            'instansi_kode_lokasi' => ['nullable', 'string', 'max:50'],
            'instansi_alamat' => ['nullable', 'string', 'max:500'],
            'instansi_telepon' => ['nullable', 'string', 'max:50'],
            'instansi_fax' => ['nullable', 'string', 'max:50'],
            'instansi_website' => ['nullable', 'string', 'max:255'],
            'instansi_email' => ['nullable', 'string', 'max:255'],
            'ttd_kepala_nama' => ['nullable', 'string', 'max:255'],
            'ttd_kepala_nip' => ['nullable', 'string', 'max:50'],
            'ttd_pengurus_nama' => ['nullable', 'string', 'max:255'],
            'ttd_pengurus_nip' => ['nullable', 'string', 'max:50'],
            'ttd_kota' => ['nullable', 'string', 'max:100'],
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value);
        }

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
