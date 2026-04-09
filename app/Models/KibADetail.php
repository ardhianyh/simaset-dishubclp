<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KibADetail extends Model
{
    protected $fillable = [
        'asset_id',
        'luas_m2',
        'tahun_pengadaan',
        'alamat',
        'hak_tanah',
        'sertifikat_tanggal',
        'sertifikat_nomor',
        'penggunaan',
    ];

    protected function casts(): array
    {
        return [
            'luas_m2' => 'decimal:2',
            'sertifikat_tanggal' => 'date',
        ];
    }

    public const HAK_TANAH_OPTIONS = [
        'Hak Pakai',
        'Hak Pengelolaan',
        'Hak Milik',
        'Hak Guna Bangunan',
        'Hak Guna Usaha',
        'Lainnya',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
