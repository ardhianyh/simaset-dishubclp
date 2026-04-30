<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class RuanganScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $user = Auth::user();

        if ($user && $user->role === 'staff') {
            $ruanganIds = $user->ruangans()->pluck('ruangans.id');
            $builder->whereIn('ruangan_id', $ruanganIds);
        }
    }
}
