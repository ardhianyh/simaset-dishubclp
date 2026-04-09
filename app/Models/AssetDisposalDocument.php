<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetDisposalDocument extends Model
{
    protected $fillable = [
        'disposal_id',
        'jenis_dokumen',
        'nama_asli',
        'nama_file',
        'path',
        'ukuran_bytes',
        'mime_type',
        'uploaded_by',
    ];

    public function disposal(): BelongsTo
    {
        return $this->belongsTo(AssetDisposal::class, 'disposal_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
