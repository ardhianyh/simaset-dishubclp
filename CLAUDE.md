# SIMASET - Development Guide

## Project Overview

Sistem Manajemen Aset - aplikasi pengelolaan aset dinas (KIB A-L) untuk PNS/petugas lapangan.
PRD lengkap: `PRD.md`. Reference PDF KIB templates: `kib/`.

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

- **Commit format:** Conventional Commits, single line, English
  - `feat: add user export feature`
  - `fix: resolve asset search pagination`
  - `refactor: simplify KIB form validation`
  - `chore: update dependencies`
  - `docs: update PRD with new requirements`
  - `style: fix dashboard layout alignment`
  - `perf: optimize asset query with eager loading`
- **Branch:** Work on `master` (single developer workflow)
- **Co-author line:** Always append `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`

## Architecture

### Backend

- Single `AssetController` handles all 6 KIB types via `{kibSlug}` route param
- Route regex: `kib-[a-el]` (character class: a-e + l)
- Base table (`assets`) + detail tables (`kib_*_details`) pattern (1:1 relation)
- `WilayahScope` global scope on Asset model (auto-filter staff by region)
- Roles: `admin` (full access) and `staff` (wilayah-scoped)
- Admin middleware alias: `'admin'` -> `EnsureUserIsAdmin`
- Flash messages: `HandleInertiaRequests` -> `useFlashMessages` hook -> sonner Toaster
- Private storage for documents (UUID naming)

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

## Memory & Context

After every feature addition, modification, or removal:
1. Update this CLAUDE.md if architecture/conventions change
2. Update memory files in `.claude/projects/.../memory/`
3. Keep implementation progress current
