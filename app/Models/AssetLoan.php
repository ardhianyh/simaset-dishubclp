<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetLoan extends Model
{
    protected $fillable = [
        'asset_id',
        'ruangan_asal_id',
        'ruangan_asal_nama',
        'peminjam_nama',
        'peminjam_nip',
        'peminjam_ruangan_id',
        'peminjam_ruangan_nama',
        'keperluan',
        'dipinjam_pada',
        'rencana_kembali',
        'dikembalikan_pada',
        'catatan_kembali',
        'created_by',
        'returned_by',
    ];

    /**
     * Waktu disimpan apa adanya sesuai isian (WIB) dan dikirim tanpa zona waktu,
     * supaya tidak bergeser saat ditampilkan di browser.
     */
    protected function casts(): array
    {
        return [
            'dipinjam_pada' => 'datetime:Y-m-d H:i',
            'rencana_kembali' => 'datetime:Y-m-d H:i',
            'dikembalikan_pada' => 'datetime:Y-m-d H:i',
        ];
    }

    public function scopeAktif(Builder $query): Builder
    {
        return $query->whereNull('dikembalikan_pada');
    }

    /**
     * Staff hanya melihat peminjaman barang ruangannya sendiri, atau yang dipinjam oleh ruangannya.
     */
    public function scopeTerlihatOleh(Builder $query, User $user): Builder
    {
        if ($user->isAdmin()) {
            return $query;
        }

        $ruanganIds = $user->ruangans()->pluck('ruangans.id');

        return $query->where(function ($q) use ($ruanganIds) {
            $q->whereHas('asset', fn ($a) => $a->whereIn('ruangan_id', $ruanganIds))
                ->orWhereIn('peminjam_ruangan_id', $ruanganIds);
        });
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class)->withoutGlobalScopes();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function returner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_by');
    }
}
