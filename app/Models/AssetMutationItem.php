<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetMutationItem extends Model
{
    protected $fillable = [
        'mutation_id',
        'asset_id',
        'ruangan_asal_id',
        'ruangan_asal_nama',
        'pj_asal_nama',
        'pj_asal_nip',
    ];

    public function mutation(): BelongsTo
    {
        return $this->belongsTo(AssetMutation::class, 'mutation_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class)->withoutGlobalScopes();
    }
}
