<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Wilayah extends Model
{
    use HasFactory;

    protected $table = 'wilayahs';

    protected $fillable = [
        'nama',
        'deskripsi',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_wilayah')
            ->withTimestamps();
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }
}
