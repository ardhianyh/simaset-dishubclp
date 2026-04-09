<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KibEDetail extends Model
{
    protected $fillable = [
        'asset_id',
        'judul_pencipta',
        'spesifikasi',
        'asal_daerah',
        'pencipta',
        'bahan',
        'jenis',
        'ukuran',
        'jumlah',
        'tahun_cetak',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
