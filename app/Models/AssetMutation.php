<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetMutation extends Model
{
    public const JENIS_PINDAH_RUANGAN = 'pindah_ruangan';

    public const JENIS_GANTI_PJ = 'ganti_pj';

    protected $fillable = [
        'nomor_bast',
        'tanggal',
        'jenis',
        'ruangan_asal_id',
        'ruangan_asal_nama',
        'ruangan_tujuan_id',
        'ruangan_tujuan_nama',
        'pj_asal_nama',
        'pj_asal_nip',
        'pj_tujuan_nama',
        'pj_tujuan_nip',
        'keterangan',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(AssetMutationItem::class, 'mutation_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(AssetMutationDocument::class, 'mutation_id');
    }

    public function ruanganAsal(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_asal_id');
    }

    public function ruanganTujuan(): BelongsTo
    {
        return $this->belongsTo(Ruangan::class, 'ruangan_tujuan_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
