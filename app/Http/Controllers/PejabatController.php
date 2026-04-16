<?php

namespace App\Http\Controllers;

use App\Models\Pejabat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PejabatController extends Controller
{
    public function index(Request $request)
    {
        $query = Pejabat::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'ilike', "%{$search}%")
                  ->orWhere('nip', 'ilike', "%{$search}%")
                  ->orWhere('jabatan', 'ilike', "%{$search}%");
            });
        }

        $pejabats = $query->orderBy('nama')->paginate(10)->withQueryString();

        return Inertia::render('Pejabats/Index', [
            'pejabats' => $pejabats,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Pejabats/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30'],
            'jabatan' => ['nullable', 'string', 'max:255'],
        ]);

        Pejabat::create($validated);

        return redirect()->route('pejabats.index')->with('success', 'Data pejabat berhasil ditambahkan.');
    }

    public function edit(Pejabat $pejabat)
    {
        return Inertia::render('Pejabats/Edit', [
            'pejabat' => $pejabat,
        ]);
    }

    public function update(Request $request, Pejabat $pejabat)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30'],
            'jabatan' => ['nullable', 'string', 'max:255'],
        ]);

        $pejabat->update($validated);

        return redirect()->route('pejabats.index')->with('success', 'Data pejabat berhasil diperbarui.');
    }

    public function destroy(Pejabat $pejabat)
    {
        $pejabat->delete();

        return redirect()->route('pejabats.index')->with('success', 'Data pejabat berhasil dihapus.');
    }

    public function search(Request $request)
    {
        $search = $request->input('q', '');

        $pejabats = Pejabat::query()
            ->where(function ($q) use ($search) {
                $q->where('nama', 'ilike', "%{$search}%")
                  ->orWhere('nip', 'ilike', "%{$search}%")
                  ->orWhere('jabatan', 'ilike', "%{$search}%");
            })
            ->orderBy('nama')
            ->limit(10)
            ->get(['id', 'nama', 'nip', 'jabatan']);

        return response()->json($pejabats);
    }
}
