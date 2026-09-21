# SIMASET - Development Guide

## Project Overview

Sistem Manajemen Aset - aplikasi pengelolaan aset dinas (KIB A-L) untuk PNS/petugas lapangan.
PRD lengkap: `PRD.md`. Reference PDF KIB templates: `docs/kib/` (acuan resmi urutan kolom & format tiap rekap KIB).

## Tech Stack

- **Backend:** Laravel 12 (PHP 8.5), Inertia.js v2
- **Frontend:** React 18 + TypeScript + Vite 7
- **UI:** Tailwind CSS v4 (`@tailwindcss/vite` plugin, NOT PostCSS) + shadcn/ui (New York, Neutral)
- **Database:** PostgreSQL (Docker: `simaset-postgres`)
- **RBAC:** Spatie Laravel Permission
- **Audit:** Spatie Activity Log
- **PDF:** DomPDF + mPDF
- **Maps:** Leaflet + react-leaflet@4
- **Import/Export:** PhpSpreadsheet
- **Auth:** Laravel Breeze + Sanctum

## Dev Commands

```bash
# Start dev
php artisan serve          # Backend
npm run dev                # Frontend (Vite)
docker compose up -d       # PostgreSQL

# Database
php artisan migrate
php artisan db:seed

# Testing
php artisan test
npm run build              # Type check + build

# Code quality
./vendor/bin/pint          # PHP formatting
npx tsc --noEmit           # TypeScript check
```

## Git Conventions

- **Commit format:** Conventional Commits, single line, English, no body, no Co-Authored-By trailer
  - `feat: add user export feature`
  - `fix: resolve asset search pagination`
  - `refactor: simplify KIB form validation`
  - `chore: update dependencies`
  - `docs: update PRD with new requirements`
  - `style: fix dashboard layout alignment`
  - `perf: optimize asset query with eager loading`
- **Branch:** Work on `master` (single developer workflow)

## Architecture

### Backend

- Single `AssetController` handles all 6 KIB types via `{kibSlug}` route param
- Route regex: `kib-[a-el]` (character class: a-e + l)
- Base table (`assets`) + detail tables (`kib_*_details`) pattern (1:1 relation)
- `RuanganScope` global scope on Asset model (auto-filter staff by ruangan); `WilayahScope` retained but unused — wilayah master data is hidden in the asset flows
- Roles: `admin` (full access) and `staff` (ruangan-scoped)
- Admin middleware alias: `'admin'` -> `EnsureUserIsAdmin`
- Flash messages: `HandleInertiaRequests` -> `useFlashMessages` hook -> sonner Toaster
- Private storage for documents (UUID naming)

### Export PDF

- Semua template export berbagi `resources/views/exports/_styles.blade.php` (font, logo, header, tabel, blok TTD) — jangan bikin style sendiri per template
- Rekap KIB (A-E, L) extend `exports/_layout.blade.php`; KIR ruangan berdiri sendiri karena header/info/TTD-nya beda
- Logo di kiri atas, blok info instansi rata kiri sejajar logo (bukan indent)
- Kolom kosong dibiarkan kosong, bukan diisi `-`
- Harga: KIB A-E dan KIR dibagi 1000 (ikut contoh dokumen resmi); hanya KIB L yang rupiah penuh
- KIB B urutan kolom: Kode Barang (2) lalu Nama Barang (3) — beda dari KIB lain, ikut template resmi
- Label QR: logo `public/logo.png` di samping nama instansi; kode lokasi = setting `label_kode_lokasi` + tahun perolehan aset (`Asset::tahunPerolehan()`); baris kode barang digabung nomor register
- KIR selalu `PER 01 -Januari-<tahun berjalan>` dan tanggal TTD-nya sama; nama bulan ditulis eksplisit karena `APP_LOCALE` beda antar environment (lokal `en`, prod `id`)
- `ExportController::raisePdfLimits()` wajib dipanggil sebelum render PDF tabel besar — rekap KIB B (456 baris) butuh ~300MB, sedangkan php-fpm prod efektif 128MB

### Frontend

- Directory casing: **lowercase** (`components/`, `layouts/`, `pages/`)
- Imports use `@/` alias -> `resources/js/`
- `header` prop in AuthenticatedLayout is `string` type
- Use `PageProps` from `@/types` for `usePage<PageProps>()`
- KIB form data: `Record<string, any>` + `useState` + `router.post/put` (NOT `useForm` - doesn't work with nested objects)
- Lazy-loaded MapView component on Dashboard
- Leaflet default marker icons need explicit import fix

### Key Directories

```
app/Http/Controllers/     # 21 controllers
app/Models/               # 13 models (Asset, User, Wilayah, Setting, KIB details, documents)
resources/js/pages/       # 37 React pages
resources/js/components/  # 33 components (shadcn/ui + custom)
resources/js/layouts/     # AuthenticatedLayout, GuestLayout
resources/js/hooks/       # useFlashMessages
database/migrations/      # 21 migrations
```

## Common Pitfalls

- `@types/node` must be ^22 (not ^18) due to vite@7
- Inertia `useForm` doesn't work with nested objects of `unknown` type
- Leaflet default marker icons need explicit import fix in bundled envs
- `usePage` generic must satisfy PageProps constraint
- react-leaflet@4 required for React 18 compat (v5 needs React 19)
- DomPDF: selector `*` untuk reset margin ikut membatalkan `@page { margin }` sehingga halaman lanjutan kehilangan margin atas — pakai reset per-elemen (lihat `exports/_styles.blade.php`)

## Memory & Context

After every feature addition, modification, or removal:
1. Update this CLAUDE.md if architecture/conventions change
2. Update memory files in `.claude/projects/.../memory/`
3. Keep implementation progress current
