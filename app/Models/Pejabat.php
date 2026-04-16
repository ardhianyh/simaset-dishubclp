<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pejabat extends Model
{
    protected $fillable = [
        'nama',
        'nip',
        'jabatan',
    ];
}
