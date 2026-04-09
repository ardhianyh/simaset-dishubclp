<?php

namespace App\Http\Controllers;

use App\Models\Wilayah;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class WilayahController extends Controller
{
    public function index(Request $request)
    {
        $query = Wilayah::withCount('users');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'ilike', "%{$search}%")
                  ->orWhere('deskripsi', 'ilike', "%{$search}%");
            });
        }

        $wilayahs = $query->orderBy('nama')->paginate(10)->withQueryString();

        return Inertia::render('Wilayah/Index', [
            'wilayahs' => $wilayahs,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Wilayah/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255', 'unique:wilayahs,nama'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
        ]);

        Wilayah::create($validated);

        return redirect()->route('wilayah.index')->with('success', 'Wilayah berhasil ditambahkan.');
    }

    public function edit(Wilayah $wilayah)
    {
        $wilayah->load('users:id,name,nip,email,role');

        return Inertia::render('Wilayah/Edit', [
            'wilayah' => $wilayah,
        ]);
    }

    public function update(Request $request, Wilayah $wilayah)
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255', Rule::unique('wilayahs', 'nama')->ignore($wilayah->id)],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
        ]);

        $wilayah->update($validated);

        return redirect()->route('wilayah.index')->with('success', 'Wilayah berhasil diperbarui.');
    }

    public function destroy(Wilayah $wilayah)
    {
        if ($wilayah->users()->exists()) {
            return back()->with('error', 'Wilayah tidak dapat dihapus karena masih memiliki staff yang terdaftar.');
        }

        if ($wilayah->assets()->exists()) {
            return back()->with('error', 'Wilayah tidak dapat dihapus karena masih memiliki aset yang terdaftar.');
        }

        $wilayah->delete();

        return redirect()->route('wilayah.index')->with('success', 'Wilayah berhasil dihapus.');
    }
}
