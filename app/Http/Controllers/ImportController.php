<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Wilayah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImportController extends Controller
{
    private function resolveKibType(string $kibSlug): string
    {
        $type = strtoupper(str_replace('kib-', '', $kibSlug));

        if (! in_array($type, Asset::KIB_TYPES)) {
            abort(404);
        }

        return $type;
    }

    private function baseColumns(): array
    {
        return [
            'nama_barang',
            'kode_barang',
            'nomor_register',
            'wilayah_nama',
            'pj_nama',
            'pj_nip',
            'pj_telepon',
            'pj_alamat',
            'latitude',
            'longitude',
            'asal_usul',
            'harga',
            'keterangan',
        ];
    }

    private function columnLabels(): array
    {
        return [
            'nama_barang' => 'Nama Barang',
            'kode_barang' => 'Kode Barang',
            'nomor_register' => 'Nomor Register',
            'wilayah_nama' => 'Nama Wilayah',
            'pj_nama' => 'Nama PJ',
            'pj_nip' => 'NIP PJ',
            'pj_telepon' => 'Telepon PJ',
            'pj_alamat' => 'Alamat PJ',
            'latitude' => 'Latitude',
            'longitude' => 'Longitude',
            'asal_usul' => 'Asal Usul',
            'harga' => 'Harga',
            'keterangan' => 'Keterangan',
            // KIB A
            'luas_m2' => 'Luas (m²)',
            'tahun_pengadaan' => 'Tahun Pengadaan',
            'alamat' => 'Alamat',
            'hak_tanah' => 'Hak Tanah',
            'sertifikat_tanggal' => 'Tanggal Sertifikat',
            'sertifikat_nomor' => 'Nomor Sertifikat',
            'penggunaan' => 'Penggunaan',
            // KIB B
            'merk_type' => 'Merk/Type',
            'ukuran_cc' => 'Ukuran/CC',
            'bahan' => 'Bahan',
            'tahun_pembelian' => 'Tahun Pembelian',
            'nomor_pabrik' => 'Nomor Pabrik',
            'nomor_rangka' => 'Nomor Rangka',
            'nomor_mesin' => 'Nomor Mesin',
            'nomor_polisi' => 'Nomor Polisi',
            'nomor_bpkb' => 'Nomor BPKB',
            // KIB C
            'kondisi' => 'Kondisi',
            'bertingkat' => 'Bertingkat (Ya/Tidak)',
            'beton' => 'Beton (Ya/Tidak)',
            'luas_lantai_m2' => 'Luas Lantai (m²)',
            'dokumen_tanggal' => 'Tanggal Dokumen',
            'dokumen_nomor' => 'Nomor Dokumen',
            'status_tanah' => 'Status Tanah',
            'nomor_kode_tanah' => 'Nomor Kode Tanah',
            // KIB D
            'konstruksi' => 'Konstruksi',
            'panjang_km' => 'Panjang (km)',
            'lebar_m' => 'Lebar (m)',
            // KIB E
            'judul_pencipta' => 'Judul/Pencipta',
            'spesifikasi' => 'Spesifikasi',
            'asal_daerah' => 'Asal Daerah',
            'pencipta' => 'Pencipta',
            'jenis' => 'Jenis',
            'ukuran' => 'Ukuran',
            'jumlah' => 'Jumlah',
            'tahun_cetak' => 'Tahun Cetak',
            // KIB L
            'judul_nama' => 'Judul/Nama',
        ];
    }

    private function detailColumns(string $kibType): array
    {
        return match ($kibType) {
            'A' => ['luas_m2', 'tahun_pengadaan', 'alamat', 'hak_tanah', 'sertifikat_tanggal', 'sertifikat_nomor', 'penggunaan'],
            'B' => ['merk_type', 'ukuran_cc', 'bahan', 'tahun_pembelian', 'nomor_pabrik', 'nomor_rangka', 'nomor_mesin', 'nomor_polisi', 'nomor_bpkb'],
            'C' => ['kondisi', 'bertingkat', 'beton', 'luas_lantai_m2', 'alamat', 'dokumen_tanggal', 'dokumen_nomor', 'status_tanah', 'nomor_kode_tanah'],
            'D' => ['konstruksi', 'panjang_km', 'lebar_m', 'luas_m2', 'alamat', 'dokumen_tanggal', 'dokumen_nomor', 'status_tanah', 'nomor_kode_tanah', 'kondisi'],
            'E' => ['judul_pencipta', 'spesifikasi', 'asal_daerah', 'pencipta', 'bahan', 'jenis', 'ukuran', 'jumlah', 'tahun_cetak'],
            'L' => ['tahun_pengadaan', 'judul_nama', 'pencipta', 'spesifikasi', 'kondisi'],
        };
    }

    private function exampleRow(string $kibType): array
    {
        $base = [
            'Laptop Dell Latitude 5520',
            '02.06.02.01.37',
            '0001',
            'Kecamatan Barat',
            'Budi Santoso',
            '198501012010011001',
            '081234567890',
            'Jl. Merdeka No. 10, Cilacap',
            '-6.200000',
            '106.816666',
            'Pembelian',
            '15000000',
            'Kondisi baik',
        ];

        $detail = match ($kibType) {
            'A' => ['500', '2023', 'Jl. Merdeka No. 1', 'Hak Milik', '2023-01-15', 'SHM-001', 'Perkantoran'],
            'B' => ['Dell Latitude', '2500cc', 'Logam', '2023', 'NP-001', 'NR-001', 'NM-001', 'B 1234 CD', 'BPKB-001'],
            'C' => ['Baik', 'Ya', 'Ya', '200', 'Jl. Merdeka No. 1', '2023-01-15', 'DOC-001', 'Milik Pemda', 'KT-001'],
            'D' => ['Beton Bertulang', '5.5', '8', '44000', 'Jl. Merdeka No. 1', '2023-01-15', 'DOC-001', 'Milik Pemda', 'KT-001', 'Baik'],
            'E' => ['Lukisan Panorama', 'Cat minyak di kanvas', 'Jawa Barat', 'Raden Saleh', 'Kanvas', 'Lukisan', '100x80 cm', '1', '2020'],
            'L' => ['2023', 'Buku Inventaris', 'Tim Aset', 'Cetakan ke-3', 'Baik'],
        };

        return array_merge($base, $detail);
    }

    private function baseValidationRules(): array
    {
        return [
            'nama_barang' => ['required', 'string', 'max:500'],
            'kode_barang' => ['required', 'string', 'max:50'],
            'nomor_register' => ['required', 'string', 'max:50'],
            'wilayah_id' => ['nullable', 'exists:wilayahs,id'],
            'pj_nama' => ['required', 'string', 'max:255'],
            'pj_nip' => ['nullable', 'string', 'max:50'],
            'pj_telepon' => ['nullable', 'string', 'max:20'],
            'pj_alamat' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'asal_usul' => ['required', 'in:' . implode(',', Asset::ASAL_USUL_OPTIONS)],
            'harga' => ['required', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string', 'max:2000'],
        ];
    }

    private function detailValidationRules(string $kibType): array
    {
        return match ($kibType) {
            'A' => [
                'detail.luas_m2' => ['required', 'numeric', 'min:0'],
                'detail.tahun_pengadaan' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
                'detail.alamat' => ['required', 'string', 'max:2000'],
                'detail.hak_tanah' => ['nullable', 'string', 'max:100'],
                'detail.sertifikat_tanggal' => ['nullable', 'date'],
                'detail.sertifikat_nomor' => ['nullable', 'string', 'max:100'],
                'detail.penggunaan' => ['nullable', 'string', 'max:255'],
            ],
            'B' => [
                'detail.merk_type' => ['nullable', 'string', 'max:255'],
                'detail.ukuran_cc' => ['nullable', 'string', 'max:100'],
                'detail.bahan' => ['nullable', 'string', 'max:100'],
                'detail.tahun_pembelian' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
                'detail.nomor_pabrik' => ['nullable', 'string', 'max:100'],
                'detail.nomor_rangka' => ['nullable', 'string', 'max:100'],
                'detail.nomor_mesin' => ['nullable', 'string', 'max:100'],
                'detail.nomor_polisi' => ['nullable', 'string', 'max:20'],
                'detail.nomor_bpkb' => ['nullable', 'string', 'max:100'],
            ],
            'C' => [
                'detail.kondisi' => ['required', 'in:Baik,Kurang Baik,Rusak Berat'],
                'detail.bertingkat' => ['required', 'boolean'],
                'detail.beton' => ['required', 'boolean'],
                'detail.luas_lantai_m2' => ['nullable', 'numeric', 'min:0'],
                'detail.alamat' => ['required', 'string', 'max:2000'],
                'detail.dokumen_tanggal' => ['nullable', 'date'],
                'detail.dokumen_nomor' => ['nullable', 'string', 'max:255'],
                'detail.status_tanah' => ['nullable', 'string', 'max:100'],
                'detail.nomor_kode_tanah' => ['nullable', 'string', 'max:100'],
            ],
            'D' => [
                'detail.konstruksi' => ['nullable', 'string', 'max:255'],
                'detail.panjang_km' => ['nullable', 'numeric', 'min:0'],
                'detail.lebar_m' => ['nullable', 'numeric', 'min:0'],
                'detail.luas_m2' => ['nullable', 'numeric', 'min:0'],
                'detail.alamat' => ['required', 'string', 'max:2000'],
                'detail.dokumen_tanggal' => ['nullable', 'date'],
                'detail.dokumen_nomor' => ['nullable', 'string', 'max:255'],
                'detail.status_tanah' => ['nullable', 'string', 'max:100'],
                'detail.nomor_kode_tanah' => ['nullable', 'string', 'max:100'],
                'detail.kondisi' => ['nullable', 'in:Baik,Kurang Baik,Rusak Berat'],
            ],
            'E' => [
                'detail.judul_pencipta' => ['nullable', 'string', 'max:255'],
                'detail.spesifikasi' => ['nullable', 'string', 'max:2000'],
                'detail.asal_daerah' => ['nullable', 'string', 'max:255'],
                'detail.pencipta' => ['nullable', 'string', 'max:255'],
                'detail.bahan' => ['nullable', 'string', 'max:255'],
                'detail.jenis' => ['nullable', 'string', 'max:255'],
                'detail.ukuran' => ['nullable', 'string', 'max:255'],
                'detail.jumlah' => ['required', 'integer', 'min:1'],
                'detail.tahun_cetak' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
            ],
            'L' => [
                'detail.tahun_pengadaan' => ['required', 'integer', 'min:1900', 'max:' . (date('Y') + 1)],
                'detail.judul_nama' => ['nullable', 'string', 'max:500'],
                'detail.pencipta' => ['nullable', 'string', 'max:255'],
                'detail.spesifikasi' => ['nullable', 'string', 'max:2000'],
                'detail.kondisi' => ['nullable', 'string', 'max:100'],
            ],
        };
    }

    public function template(string $kibSlug): StreamedResponse
    {
        $kibType = $this->resolveKibType($kibSlug);
        $columns = array_merge($this->baseColumns(), $this->detailColumns($kibType));
        $labels = $this->columnLabels();
        $example = $this->exampleRow($kibType);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Template Import');

        // Row 1: column keys (hidden reference row)
        // Row 2: human-readable labels (header)
        // Row 3: example data
        $baseCount = count($this->baseColumns());
        $totalCols = count($columns);

        foreach ($columns as $i => $col) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i + 1);

            // Row 1: key (will be hidden)
            $sheet->setCellValue("{$colLetter}1", $col);

            // Row 2: label
            $label = $labels[$col] ?? $col;
            if ($i < $baseCount) {
                $label .= ' *';
            }
            $sheet->setCellValue("{$colLetter}2", $label);

            // Row 3: example
            $sheet->setCellValue("{$colLetter}3", $example[$i] ?? '');

            // Auto-width
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        // Style row 1 (key row) — small grey font
        $lastCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($totalCols);
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['size' => 8, 'color' => ['rgb' => '999999'], 'italic' => true],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(15);

        // Style row 2 (header) — bold, colored background
        $sheet->getStyle("A2:{$lastCol}2")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4472C4'],
            ],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN],
            ],
        ]);

        // Style row 3 (example) — light background
        $sheet->getStyle("A3:{$lastCol}3")->applyFromArray([
            'font' => ['italic' => true, 'color' => ['rgb' => '666666']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'FFF2CC'],
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN],
            ],
        ]);

        // Add notes sheet
        $notesSheet = $spreadsheet->createSheet();
        $notesSheet->setTitle('Petunjuk');
        $notes = [
            ['PETUNJUK PENGISIAN TEMPLATE IMPORT ' . Asset::KIB_LABELS[$kibType]],
            [''],
            ['1. Isi data mulai dari baris ke-4 di sheet "Template Import" (baris 3 adalah contoh, boleh dihapus/ditimpa)'],
            ['2. Baris 1 berisi kode kolom (JANGAN dihapus/diubah)'],
            ['3. Baris 2 berisi nama kolom yang ditandai * adalah kolom wajib'],
            ['4. Kolom "Nama Wilayah" harus sesuai dengan nama wilayah yang terdaftar di sistem'],
            ['5. Kolom "Asal Usul" harus salah satu dari: ' . implode(', ', Asset::ASAL_USUL_OPTIONS)],
            ['6. Format tanggal: YYYY-MM-DD (contoh: 2023-01-15)'],
            ['7. Kolom "Harga" berupa angka tanpa titik/koma (contoh: 15000000)'],
            ['8. Kolom "Latitude" dan "Longitude" opsional, format desimal (contoh: -6.200000)'],
        ];

        if ($kibType === 'C') {
            $notes[] = ['9. Kolom "Bertingkat" dan "Beton" diisi Ya atau Tidak'];
            $notes[] = ['10. Kolom "Kondisi" harus salah satu dari: Baik, Kurang Baik, Rusak Berat'];
        } elseif (in_array($kibType, ['D'])) {
            $notes[] = ['9. Kolom "Kondisi" harus salah satu dari: Baik, Kurang Baik, Rusak Berat'];
        }

        foreach ($notes as $i => $row) {
            $notesSheet->setCellValue('A' . ($i + 1), $row[0]);
        }
        $notesSheet->getStyle('A1')->getFont()->setBold(true)->setSize(12);
        $notesSheet->getColumnDimension('A')->setWidth(90);

        // Set active sheet back to template
        $spreadsheet->setActiveSheetIndex(0);

        $filename = "template_import_{$kibSlug}.xlsx";

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
            $spreadsheet->disconnectWorksheets();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function import(Request $request, string $kibSlug)
    {
        $kibType = $this->resolveKibType($kibSlug);

        $request->validate([
            'file' => ['required', 'file', 'max:5120'],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, ['xlsx', 'xls', 'csv'])) {
            return back()->with('error', 'Format file tidak didukung. Gunakan file .xlsx, .xls, atau .csv.');
        }

        try {
            $spreadsheet = IOFactory::load($file->getRealPath());
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal membaca file. Pastikan file Excel valid.');
        }

        $sheet = $spreadsheet->getActiveSheet();
        $highestRow = $sheet->getHighestRow();
        $highestCol = $sheet->getHighestColumn();
        $totalCols = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestCol);

        if ($highestRow < 2) {
            $spreadsheet->disconnectWorksheets();
            return back()->with('error', 'File tidak berisi data.');
        }

        // Read row 1 as column keys
        $headerKeys = [];
        for ($col = 1; $col <= $totalCols; $col++) {
            $value = $sheet->getCellByColumnAndRow($col, 1)->getValue();
            $headerKeys[] = trim((string) ($value ?? ''));
        }

        $expectedHeaders = array_merge($this->baseColumns(), $this->detailColumns($kibType));

        // Filter out empty trailing columns
        $headerKeys = array_slice($headerKeys, 0, count($expectedHeaders));

        if ($headerKeys !== $expectedHeaders) {
            $spreadsheet->disconnectWorksheets();
            return back()->with('error', 'Header kolom tidak sesuai template. Download template terbaru dan coba lagi.');
        }

        // Build wilayah lookup
        $wilayahLookup = Wilayah::pluck('id', 'nama')->toArray();

        // Determine allowed wilayah IDs for staff
        $user = auth()->user();
        $allowedWilayahIds = null;
        if ($user->role === 'staff') {
            $allowedWilayahIds = $user->wilayahs()->pluck('wilayahs.id')->toArray();
        }

        $baseColumns = $this->baseColumns();
        $detailCols = $this->detailColumns($kibType);
        $baseRules = $this->baseValidationRules();
        $detailRules = $this->detailValidationRules($kibType);

        $flatDetailRules = [];
        foreach ($detailRules as $key => $rules) {
            $flatKey = str_replace('detail.', '', $key);
            $flatDetailRules[$flatKey] = $rules;
        }

        $rows = [];
        $errors = [];

        // Data starts at row 3 (row 1 = keys, row 2 = labels, row 3+ = data)
        for ($rowNum = 3; $rowNum <= $highestRow; $rowNum++) {
            // Read row values
            $rowValues = [];
            $hasData = false;
            for ($col = 1; $col <= count($expectedHeaders); $col++) {
                $cellValue = $sheet->getCellByColumnAndRow($col, $rowNum)->getValue();
                $val = trim((string) ($cellValue ?? ''));
                $rowValues[] = $val;
                if ($val !== '') {
                    $hasData = true;
                }
            }

            // Skip empty rows
            if (! $hasData) {
                continue;
            }

            // Map values to column names
            $data = [];
            foreach ($expectedHeaders as $i => $col) {
                $data[$col] = $rowValues[$i] ?? '';
            }

            // Resolve wilayah_nama to wilayah_id
            $wilayahNama = $data['wilayah_nama'] ?? '';
            $wilayahId = null;
            $wilayahError = null;

            if ($wilayahNama !== '') {
                $wilayahId = $wilayahLookup[$wilayahNama] ?? null;
                if (! $wilayahId) {
                    $wilayahError = "Wilayah \"{$wilayahNama}\" tidak ditemukan.";
                } elseif ($allowedWilayahIds !== null && ! in_array($wilayahId, $allowedWilayahIds)) {
                    $wilayahError = "Anda tidak memiliki akses ke wilayah \"{$wilayahNama}\".";
                    $wilayahId = null;
                }
            }

            // Build base data
            $baseData = [];
            foreach ($baseColumns as $col) {
                if ($col === 'wilayah_nama') continue;
                $baseData[$col] = $data[$col] !== '' ? $data[$col] : null;
            }
            $baseData['wilayah_id'] = $wilayahId;

            // Build detail data
            $detailData = [];
            foreach ($detailCols as $col) {
                $detailData[$col] = $data[$col] !== '' ? $data[$col] : null;
            }

            // Cast boolean fields for KIB C
            if ($kibType === 'C') {
                if (isset($detailData['bertingkat'])) {
                    $detailData['bertingkat'] = in_array(strtolower((string) $detailData['bertingkat']), ['1', 'true', 'ya', 'yes']);
                }
                if (isset($detailData['beton'])) {
                    $detailData['beton'] = in_array(strtolower((string) $detailData['beton']), ['1', 'true', 'ya', 'yes']);
                }
            }

            // Validate
            $baseValidator = Validator::make($baseData, $baseRules);
            $detailValidator = Validator::make($detailData, $flatDetailRules);

            $rowErrors = [];

            if ($wilayahError) {
                $rowErrors[] = $wilayahError;
            }
            if ($baseValidator->fails()) {
                foreach ($baseValidator->errors()->all() as $msg) {
                    $rowErrors[] = $msg;
                }
            }
            if ($detailValidator->fails()) {
                foreach ($detailValidator->errors()->all() as $msg) {
                    $rowErrors[] = $msg;
                }
            }

            if (! empty($rowErrors)) {
                $errors[] = [
                    'row' => $rowNum,
                    'messages' => $rowErrors,
                ];
                continue;
            }

            $rows[] = [
                'base' => $baseData,
                'detail' => $detailData,
            ];
        }

        $spreadsheet->disconnectWorksheets();

        if (empty($rows) && empty($errors)) {
            return back()->with('error', 'File tidak berisi data.');
        }

        if (! empty($errors)) {
            return back()->with('import_errors', $errors)
                ->with('error', 'Terdapat ' . count($errors) . ' baris dengan kesalahan. Tidak ada data yang diimpor.');
        }

        // All rows valid — bulk insert in transaction
        $successCount = 0;

        DB::transaction(function () use ($rows, $kibType, $user, &$successCount) {
            foreach ($rows as $row) {
                $asset = Asset::create([
                    ...$row['base'],
                    'kib_type' => $kibType,
                    'created_by' => $user->id,
                    'updated_by' => $user->id,
                ]);

                $detailModel = Asset::DETAIL_MODELS[$kibType];
                $detailModel::create([
                    'asset_id' => $asset->id,
                    ...$row['detail'],
                ]);

                $successCount++;
            }
        });

        return back()->with('success', "Berhasil mengimpor {$successCount} data aset.");
    }
}
