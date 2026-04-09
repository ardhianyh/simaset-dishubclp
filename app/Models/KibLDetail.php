<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KibLDetail extends Model
{
    protected $fillable = [
        'asset_id',
        'tahun_pengadaan',
        'judul_nama',
        'pencipta',
        'spesifikasi',
        'kondisi',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
