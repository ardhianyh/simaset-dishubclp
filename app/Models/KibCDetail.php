<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KibCDetail extends Model
{
    protected $fillable = [
        'asset_id',
        'kondisi',
        'bertingkat',
        'beton',
        'luas_lantai_m2',
        'alamat',
        'dokumen_tanggal',
        'dokumen_nomor',
        'status_tanah',
        'nomor_kode_tanah',
    ];

    protected function casts(): array
    {
        return [
            'bertingkat' => 'boolean',
            'beton' => 'boolean',
            'luas_lantai_m2' => 'decimal:2',
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
