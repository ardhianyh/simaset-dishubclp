<?php

namespace App\Console\Commands;

use App\Http\Controllers\ExportController;
use App\Models\Asset;
use App\Models\AssetGeneratedDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Throwable;

class RegenerateDocuments extends Command
{
    protected $signature = 'docs:regenerate
                            {jenis? : bast|pakta_integritas|all (default: all)}
                            {--asset= : Regenerate only for a specific asset id}
                            {--dry-run : List what would be regenerated without writing}';

    protected $description = 'Rebuild cached BAST / Pakta Integritas PDFs from saved metadata using current templates';

    public function handle(ExportController $exporter): int
    {
        $jenis = $this->argument('jenis') ?: 'all';

        $allowed = ['bast', 'pakta_integritas', 'all'];
        if (! in_array($jenis, $allowed, true)) {
            $this->error("Invalid jenis '{$jenis}'. Allowed: ".implode(', ', $allowed));

            return self::FAILURE;
        }

        $query = AssetGeneratedDocument::query()
            ->when($jenis !== 'all', fn ($q) => $q->where('jenis', $jenis))
            ->when($this->option('asset'), fn ($q, $id) => $q->where('asset_id', $id))
            ->orderBy('asset_id');

        $total = $query->count();
        if ($total === 0) {
            $this->info('No cached documents match the filter.');

            return self::SUCCESS;
        }

        $this->info("Regenerating {$total} document(s)".($this->option('dry-run') ? ' (dry-run)' : '').'...');

        $ok = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($query->lazy() as $doc) {
            $label = "asset #{$doc->asset_id} [{$doc->jenis}]";
            $metadata = $doc->metadata ?? [];

            if ($this->option('dry-run')) {
                $this->line("  would regenerate {$label}");
                $ok++;

                continue;
            }

            $asset = Asset::withoutGlobalScopes()->with('kibBDetail')->find($doc->asset_id);
            if (! $asset) {
                $this->warn("  [skip] {$label}: asset not found");
                $skipped++;

                continue;
            }

            $oldPath = $doc->path;

            try {
                if ($doc->jenis === 'bast') {
                    $exporter->generateBastPdf($asset, $this->normalizeBastMetadata($metadata, $asset), $doc->generated_by);
                } elseif ($doc->jenis === 'pakta_integritas') {
                    $exporter->generatePaktaPdf($asset, $this->normalizePaktaMetadata($metadata, $asset), $doc->generated_by);
                } else {
                    $this->warn("  [skip] {$label}: unknown jenis");
                    $skipped++;

                    continue;
                }

                if ($oldPath && $oldPath !== $doc->fresh()->path && Storage::disk('local')->exists($oldPath)) {
                    Storage::disk('local')->delete($oldPath);
                }

                $this->line("  ✓ {$label}");
                $ok++;
            } catch (Throwable $e) {
                $this->error("  ✗ {$label}: ".$e->getMessage());
                $failed++;
            }
        }

        $this->newLine();
        $this->info("Done. ok={$ok} skipped={$skipped} failed={$failed}");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function normalizeBastMetadata(array $m, Asset $asset): array
    {
        return [
            'nomor_surat' => $m['nomor_surat'] ?? '',
            'tanggal' => $m['tanggal'] ?? now()->format('Y-m-d'),
            'pihak1_nama' => $m['pihak1_nama'] ?? '',
            'pihak1_jabatan' => $m['pihak1_jabatan'] ?? '',
            'pihak1_nip' => $m['pihak1_nip'] ?? '',
            'pihak2_nama' => $m['pihak2_nama'] ?? ($asset->pj_nama ?? ''),
            'pihak2_jabatan' => $m['pihak2_jabatan'] ?? '',
            'pihak2_nip' => $m['pihak2_nip'] ?? ($asset->pj_nip ?? ''),
        ];
    }

    private function normalizePaktaMetadata(array $m, Asset $asset): array
    {
        return [
            'nama' => $m['nama'] ?? ($asset->pj_nama ?? ''),
            'nip' => $m['nip'] ?? ($asset->pj_nip ?? ''),
            'jabatan' => $m['jabatan'] ?? '',
            'tanggal' => $m['tanggal'] ?? now()->format('Y-m-d'),
        ];
    }
}
