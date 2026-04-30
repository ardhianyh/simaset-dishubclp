<?php

namespace App\Http\Controllers;

use App\Models\Ruangan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RuanganController extends Controller
{
    public function index(Request $request)
    {
        $query = Ruangan::withCount('users');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'ilike', "%{$search}%")
                    ->orWhere('deskripsi', 'ilike', "%{$search}%");
            });
        }

        $ruangans = $query->orderBy('nama')->paginate(10)->withQueryString();

        return Inertia::render('Ruangan/Index', [
            'ruangans' => $ruangans,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Ruangan/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255', 'unique:ruangans,nama'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
        ]);

        Ruangan::create($validated);

        return redirect()->route('ruangan.index')->with('success', 'Ruangan berhasil ditambahkan.');
    }

    public function edit(Ruangan $ruangan)
    {
        $ruangan->load('users:id,name,nip,email,role');

        return Inertia::render('Ruangan/Edit', [
            'ruangan' => $ruangan,
        ]);
    }

    public function update(Request $request, Ruangan $ruangan)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255', Rule::unique('ruangans', 'nama')->ignore($ruangan->id)],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
        ]);

        $ruangan->update($validated);

        return redirect()->route('ruangan.index')->with('success', 'Ruangan berhasil diperbarui.');
    }

    public function destroy(Ruangan $ruangan)
    {
        if ($ruangan->users()->exists()) {
            return back()->with('error', 'Ruangan tidak dapat dihapus karena masih memiliki staff yang terdaftar.');
        }

        if ($ruangan->assets()->exists()) {
            return back()->with('error', 'Ruangan tidak dapat dihapus karena masih memiliki aset yang terdaftar.');
        }

        $ruangan->delete();

        return redirect()->route('ruangan.index')->with('success', 'Ruangan berhasil dihapus.');
    }
}
