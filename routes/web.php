<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetDocumentController;
use App\Http\Controllers\AssetSearchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicAssetController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WilayahController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Public asset page (accessible without auth, for QR code scanning)
Route::get('/p/{asset}', [PublicAssetController::class, 'show'])->name('public.asset.show');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Search routes (cross-KIB search)
    Route::get('/search', [AssetSearchController::class, 'index'])->name('search.index');
    Route::get('/search/map', [AssetSearchController::class, 'map'])->name('search.map');

    // Export PDF
    Route::get('/export/{kibSlug}', [ExportController::class, 'export'])
        ->where('kibSlug', 'kib-[a-el]')
        ->name('export.kib');
    Route::get('/export/pakta-integritas/{asset}', [ExportController::class, 'paktaIntegritas'])
        ->name('export.pakta-integritas');
    Route::get('/export/bast/{asset}', [ExportController::class, 'bast'])
        ->name('export.bast');

    // Asset routes (accessible by both admin and staff, scoped by WilayahScope)
    Route::prefix('assets/{kibSlug}')->where(['kibSlug' => 'kib-[a-el]'])->group(function () {
        Route::get('/', [AssetController::class, 'index'])->name('assets.index');
        Route::get('/create', [AssetController::class, 'create'])->name('assets.create');
        Route::post('/', [AssetController::class, 'store'])->name('assets.store');
        Route::get('/{asset}', [AssetController::class, 'show'])->name('assets.show');
        Route::get('/{asset}/edit', [AssetController::class, 'edit'])->name('assets.edit');
        Route::put('/{asset}', [AssetController::class, 'update'])->name('assets.update');
        Route::post('/{asset}/dispose', [AssetController::class, 'destroy'])->name('assets.destroy');
        Route::get('/{asset}/qr-label', [AssetController::class, 'qrLabel'])->name('assets.qr-label');

        // Import routes
        Route::get('/template', [ImportController::class, 'template'])->name('assets.template');
        Route::post('/import', [ImportController::class, 'import'])->name('assets.import');

        // Document routes
        Route::post('/{asset}/documents', [AssetDocumentController::class, 'store'])->name('assets.documents.store');
        Route::get('/{asset}/documents/{document}', [AssetDocumentController::class, 'show'])->name('assets.documents.show');
        Route::delete('/{asset}/documents/{document}', [AssetDocumentController::class, 'destroy'])->name('assets.documents.destroy');
    });
});

// Admin-only routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::resource('wilayah', WilayahController::class)->except(['show']);
    Route::resource('users', UserController::class)->except(['show']);

    Route::get('/settings', [SettingController::class, 'edit'])->name('settings.edit');
    Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');
});

require __DIR__.'/auth.php';
