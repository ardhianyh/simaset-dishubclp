<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetDocument extends Model
{
    protected $fillable = [
        'asset_id',
        'jenis_dokumen',
        'nama_asli',
        'nama_file',
        'path',
        'ukuran_bytes',
        'mime_type',
        'uploaded_by',
    ];

    public const JENIS_OPTIONS = ['BAST', 'Foto', 'Sertifikat', 'SK', 'Lainnya'];

    public const ALLOWED_MIMES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    public const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

    public const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function formattedSize(): string
    {
        $bytes = $this->ukuran_bytes;

        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 1) . ' MB';
        }

        return number_format($bytes / 1024, 0) . ' KB';
    }
}
