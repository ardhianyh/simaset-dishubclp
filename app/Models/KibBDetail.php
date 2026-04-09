<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KibBDetail extends Model
{
    protected $fillable = [
        'asset_id',
        'merk_type',
        'ukuran_cc',
        'bahan',
        'tahun_pembelian',
        'nomor_pabrik',
        'nomor_rangka',
        'nomor_mesin',
        'nomor_polisi',
        'nomor_bpkb',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
