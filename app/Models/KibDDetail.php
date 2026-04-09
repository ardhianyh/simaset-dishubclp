<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KibDDetail extends Model
{
    protected $fillable = [
        'asset_id',
        'konstruksi',
        'panjang_km',
        'lebar_m',
        'luas_m2',
        'alamat',
        'dokumen_tanggal',
        'dokumen_nomor',
        'status_tanah',
        'nomor_kode_tanah',
        'kondisi',
    ];

    protected function casts(): array
    {
        return [
            'panjang_km' => 'decimal:3',
            'lebar_m' => 'decimal:3',
            'luas_m2' => 'decimal:2',
            'dokumen_tanggal' => 'date',
        ];
    }

    public const KONDISI_OPTIONS = ['Baik', 'Kurang Baik', 'Rusak Berat'];

    public const STATUS_TANAH_OPTIONS = [
        'Tanah Milik Pemda',
        'Tanah Milik Negara',
        'Tanah Milik Provinsi',
        'Lainnya',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
