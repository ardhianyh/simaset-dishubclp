<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AssetDocumentController extends Controller
{
    public function store(Request $request, string $kibSlug, Asset $asset)
    {
        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240', // 10MB
                'mimes:pdf,jpg,jpeg,png,doc,docx',
            ],
            'jenis_dokumen' => ['required', 'in:' . implode(',', AssetDocument::JENIS_OPTIONS)],
        ]);

        $file = $request->file('file');
        $namaFile = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('asset-documents/' . $asset->id, $namaFile, 'local');

        $asset->documents()->create([
            'jenis_dokumen' => $validated['jenis_dokumen'],
            'nama_asli' => $file->getClientOriginalName(),
            'nama_file' => $namaFile,
            'path' => $path,
            'ukuran_bytes' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => auth()->id(),
        ]);

        return back()->with('success', 'Dokumen berhasil diupload.');
    }

    public function show(string $kibSlug, Asset $asset, AssetDocument $document)
    {
        if ($document->asset_id !== $asset->id) {
            abort(404);
        }

        if (! Storage::disk('local')->exists($document->path)) {
            abort(404, 'File tidak ditemukan.');
        }

        $previewable = str_starts_with($document->mime_type, 'image/') || $document->mime_type === 'application/pdf';

        if ($previewable && request()->query('download') === null) {
            return Storage::disk('local')->response($document->path, $document->nama_asli);
        }

        return Storage::disk('local')->download($document->path, $document->nama_asli);
    }

    public function destroy(string $kibSlug, Asset $asset, AssetDocument $document)
    {
        if ($document->asset_id !== $asset->id) {
            abort(404);
        }

        Storage::disk('local')->delete($document->path);
        $document->delete();

        return back()->with('success', 'Dokumen berhasil dihapus.');
    }
}
