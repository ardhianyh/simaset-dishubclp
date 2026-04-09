<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wilayah;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('wilayahs:id,nama');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('nip', 'ilike', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        $users = $query->orderBy('name')->paginate(10)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'wilayahs' => Wilayah::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'in:admin,staff'],
            'telepon' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
            'wilayah_ids' => ['nullable', 'array'],
            'wilayah_ids.*' => ['exists:wilayahs,id'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'nip' => $validated['nip'] ?? null,
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'],
            'telepon' => $validated['telepon'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (! empty($validated['wilayah_ids'])) {
            $user->wilayahs()->sync($validated['wilayah_ids']);
        }

        return redirect()->route('users.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function edit(User $user)
    {
        $user->load('wilayahs:id,nama');

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'wilayahs' => Wilayah::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', Password::defaults()],
            'role' => ['required', 'in:admin,staff'],
            'telepon' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
            'wilayah_ids' => ['nullable', 'array'],
            'wilayah_ids.*' => ['exists:wilayahs,id'],
        ]);

        $userData = [
            'name' => $validated['name'],
            'nip' => $validated['nip'] ?? null,
            'email' => $validated['email'],
            'role' => $validated['role'],
            'telepon' => $validated['telepon'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ];

        if (! empty($validated['password'])) {
            $userData['password'] = $validated['password'];
        }

        $user->update($userData);
        $user->wilayahs()->sync($validated['wilayah_ids'] ?? []);

        return redirect()->route('users.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $user->wilayahs()->detach();
        $user->delete();

        return redirect()->route('users.index')->with('success', 'Pengguna berhasil dihapus.');
    }
}
