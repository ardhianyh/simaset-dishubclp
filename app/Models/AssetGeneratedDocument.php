<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetGeneratedDocument extends Model
{
    protected $fillable = [
        'asset_id',
        'jenis',
        'path',
        'filename',
        'metadata',
        'generated_by',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
