<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetDisposal extends Model
{
    protected $fillable = [
        'asset_id',
        'jenis',
        'alasan',
        'nomor_sk',
        'tanggal',
        'disposed_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public const JENIS_OPTIONS = ['dihapus', 'dikembalikan', 'dihibahkan'];

    public const JENIS_LABELS = [
        'dihapus' => 'Dihapus/Dimusnahkan',
        'dikembalikan' => 'Dikembalikan',
        'dihibahkan' => 'Dihibahkan',
    ];

    public const DOKUMEN_JENIS_OPTIONS = [
        'BA Penghapusan',
        'SK Bupati',
        'BA Serah Terima',
        'BA Hibah',
        'Surat Perintah',
        'Lainnya',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(AssetDisposalDocument::class, 'disposal_id');
    }

    public function disposer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disposed_by');
    }
}
