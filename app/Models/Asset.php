<?php

namespace App\Models;

use App\Models\Scopes\WilayahScope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

#[ScopedBy(WilayahScope::class)]
class Asset extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Aset {$this->nama_barang} telah di-{$eventName}");
    }

    protected $fillable = [
        'kib_type',
        'nama_barang',
        'kode_barang',
        'nomor_register',
        'wilayah_id',
        'pj_nama',
        'pj_nip',
        'pj_telepon',
        'pj_alamat',
        'latitude',
        'longitude',
        'asal_usul',
        'harga',
        'keterangan',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'harga' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    public const KIB_TYPES = ['A', 'B', 'C', 'D', 'E', 'L'];

    public const KIB_LABELS = [
        'A' => 'KIB A - Tanah',
        'B' => 'KIB B - Peralatan & Mesin',
        'C' => 'KIB C - Gedung & Bangunan',
        'D' => 'KIB D - Jalan, Irigasi, Jaringan',
        'E' => 'KIB E - Aset Tetap Lainnya',
        'L' => 'KIB L - Aset Lainnya',
    ];

    public const ASAL_USUL_OPTIONS = [
        'Pembelian',
        'Hibah',
        'Sumbangan',
        'Tukar Menukar',
        'Lainnya',
    ];

    public const DETAIL_MODELS = [
        'A' => KibADetail::class,
        'B' => KibBDetail::class,
        'C' => KibCDetail::class,
        'D' => KibDDetail::class,
        'E' => KibEDetail::class,
        'L' => KibLDetail::class,
    ];

    public function wilayah(): BelongsTo
    {
        return $this->belongsTo(Wilayah::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(AssetDocument::class);
    }

    public function disposal(): HasOne
    {
        return $this->hasOne(AssetDisposal::class);
    }

    public function detail(): HasOne
    {
        $modelClass = self::DETAIL_MODELS[$this->kib_type] ?? null;

        if (! $modelClass) {
            return $this->hasOne(KibADetail::class, 'asset_id');
        }

        return $this->hasOne($modelClass, 'asset_id');
    }

    public function kibADetail(): HasOne
    {
        return $this->hasOne(KibADetail::class, 'asset_id');
    }

    public function kibBDetail(): HasOne
    {
        return $this->hasOne(KibBDetail::class, 'asset_id');
    }

    public function kibCDetail(): HasOne
    {
        return $this->hasOne(KibCDetail::class, 'asset_id');
    }

    public function kibDDetail(): HasOne
    {
        return $this->hasOne(KibDDetail::class, 'asset_id');
    }

    public function kibEDetail(): HasOne
    {
        return $this->hasOne(KibEDetail::class, 'asset_id');
    }

    public function kibLDetail(): HasOne
    {
        return $this->hasOne(KibLDetail::class, 'asset_id');
    }

    public function getDetailRelationName(): string
    {
        return match ($this->kib_type) {
            'A' => 'kibADetail',
            'B' => 'kibBDetail',
            'C' => 'kibCDetail',
            'D' => 'kibDDetail',
            'E' => 'kibEDetail',
            'L' => 'kibLDetail',
        };
    }
}
