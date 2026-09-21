<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetMutationDocument extends Model
{
    protected $fillable = [
        'mutation_id',
        'jenis_dokumen',
        'nama_asli',
        'nama_file',
        'path',
        'ukuran_bytes',
        'mime_type',
        'uploaded_by',
    ];

    public function mutation(): BelongsTo
    {
        return $this->belongsTo(AssetMutation::class, 'mutation_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
