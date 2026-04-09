import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PaginatedData, Asset, Wilayah, KibType, PageProps, ImportError } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import Pagination from '@/components/Pagination';
import DisposalDialog from './Partials/DisposalDialog';
import { Plus, Pencil, Trash2, Search, Eye, FileDown, Upload, Download } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';

interface Props {
    assets: PaginatedData<Asset>;
    kibType: KibType;
    kibLabel: string;
    wilayahs: Wilayah[];
    filters: {
        search?: string;
        wilayah_id?: string;
    };
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export default function AssetIndex({ assets, kibType, kibLabel, wilayahs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [importing, setImporting] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const kibSlug = `kib-${kibType.toLowerCase()}`;

    const { flash } = usePage<PageProps>().props;
    const importErrors: ImportError[] = flash.import_errors || [];

    useEffect(() => {
        if (importErrors.length > 0) {
            setShowErrors(true);
        }
    }, [importErrors]);

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(`/assets/${kibSlug}`, {
            search: search || undefined,
            wilayah_id: filters.wilayah_id || undefined,
        }, { preserveState: true });
    }

    function handleWilayahFilter(value: string) {
        router.get(`/assets/${kibSlug}`, {
            search: filters.search || undefined,
            wilayah_id: value === 'all' ? undefined : value,
        }, { preserveState: true });
    }

    const [disposalAsset, setDisposalAsset] = useState<Asset | null>(null);

    function handleImportClick() {
        fileInputRef.current?.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setImporting(true);
        router.post(`/assets/${kibSlug}/import`, { file }, {
            forceFormData: true,
            onFinish: () => {
                setImporting(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    }

    return (
        <AuthenticatedLayout header={kibLabel}>
            <Head title={kibLabel} />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Cari nama, kode, register..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-64 pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary" size="sm">
                                Cari
                            </Button>
                        </form>
                        <Select value={filters.wilayah_id || 'all'} onValueChange={handleWilayahFilter}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Semua Wilayah" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Wilayah</SelectItem>
                                {wilayahs.map((w) => (
                                    <SelectItem key={w.id} value={String(w.id)}>{w.nama}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/assets/${kibSlug}/template`}>
                                <Download className="mr-2 size-4" />
                                Template Excel
                            </a>
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <Button variant="outline" size="sm" onClick={handleImportClick} disabled={importing}>
                            <Upload className="mr-2 size-4" />
                            {importing ? 'Mengimpor...' : 'Import Excel'}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href={`/export/${kibSlug}${filters.wilayah_id ? `?wilayah_id=${filters.wilayah_id}` : ''}`}>
                                <FileDown className="mr-2 size-4" />
                                Export PDF
                            </a>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={`/assets/${kibSlug}/create`}>
                                <Plus className="mr-2 size-4" />
                                Tambah Aset
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No</TableHead>
                                <TableHead>Nama Barang</TableHead>
                                <TableHead>Kode Barang</TableHead>
                                <TableHead>No. Register</TableHead>
                                <TableHead>Wilayah</TableHead>
                                <TableHead>PJ</TableHead>
                                <TableHead className="text-right">Harga</TableHead>
                                <TableHead className="w-28 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                                        Belum ada data aset.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assets.data.map((asset, index) => (
                                    <TableRow key={asset.id}>
                                        <TableCell>{assets.from + index}</TableCell>
                                        <TableCell className="max-w-[200px] truncate font-medium">
                                            {asset.nama_barang}
                                        </TableCell>
                                        <TableCell className="text-sm">{asset.kode_barang}</TableCell>
                                        <TableCell>{asset.nomor_register}</TableCell>
                                        <TableCell>
                                            {asset.wilayah ? (
                                                <Badge variant="outline">{asset.wilayah.nama}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-[120px] truncate">{asset.pj_nama}</TableCell>
                                        <TableCell className="text-right text-sm">
                                            {formatCurrency(asset.harga)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                    <Link href={`/assets/${kibSlug}/${asset.id}`}>
                                                        <Eye className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                    <Link href={`/assets/${kibSlug}/${asset.id}/edit`}>
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-red-600 hover:text-red-700"
                                                    onClick={() => setDisposalAsset(asset)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination
                    links={assets.links}
                    from={assets.from}
                    to={assets.to}
                    total={assets.total}
                />
            </div>

            {disposalAsset && (
                <DisposalDialog
                    asset={disposalAsset}
                    kibSlug={kibSlug}
                    open={!!disposalAsset}
                    onOpenChange={(open) => { if (!open) setDisposalAsset(null); }}
                />
            )}

            <Dialog open={showErrors} onOpenChange={setShowErrors}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Kesalahan Import CSV</DialogTitle>
                        <DialogDescription>
                            Ditemukan {importErrors.length} baris dengan kesalahan. Perbaiki data dan coba lagi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                        {importErrors.map((err, i) => (
                            <div key={i} className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                                <p className="mb-1 text-sm font-medium">Baris {err.row}</p>
                                <ul className="list-inside list-disc space-y-0.5 text-sm text-red-700 dark:text-red-400">
                                    {err.messages.map((msg, j) => (
                                        <li key={j}>{msg}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
