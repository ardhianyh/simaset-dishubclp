import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Asset, Wilayah } from '@/types';
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
import Pagination from '@/components/Pagination';
import { Search, Eye, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    assets: PaginatedData<Asset>;
    wilayahs: Wilayah[];
    kibTypes: Record<string, string>;
    filters: {
        search?: string;
        kib_type?: string;
        wilayah_id?: string;
        pj_nama?: string;
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

const KIB_BADGE_COLORS: Record<string, string> = {
    A: 'bg-green-100 text-green-800',
    B: 'bg-blue-100 text-blue-800',
    C: 'bg-amber-100 text-amber-800',
    D: 'bg-purple-100 text-purple-800',
    E: 'bg-red-100 text-red-800',
    L: 'bg-cyan-100 text-cyan-800',
};

export default function SearchIndex({ assets, wilayahs, kibTypes, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [pjNama, setPjNama] = useState(filters.pj_nama || '');

    function buildParams(overrides: Record<string, string | undefined> = {}) {
        return {
            search: filters.search || undefined,
            kib_type: filters.kib_type || undefined,
            wilayah_id: filters.wilayah_id || undefined,
            pj_nama: filters.pj_nama || undefined,
            ...overrides,
        };
    }

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/search', buildParams({
            search: search || undefined,
            pj_nama: pjNama || undefined,
        }), { preserveState: true });
    }

    function handleKibFilter(value: string) {
        router.get('/search', buildParams({
            kib_type: value === 'all' ? undefined : value,
        }), { preserveState: true });
    }

    function handleWilayahFilter(value: string) {
        router.get('/search', buildParams({
            wilayah_id: value === 'all' ? undefined : value,
        }), { preserveState: true });
    }

    function handleClearFilters() {
        setSearch('');
        setPjNama('');
        router.get('/search', {}, { preserveState: true });
    }

    const hasFilters = filters.search || filters.kib_type || filters.wilayah_id || filters.pj_nama;

    return (
        <AuthenticatedLayout header="Pencarian Aset">
            <Head title="Pencarian Aset" />

            <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            placeholder="Cari nama, kode, register, PJ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="min-w-[180px]">
                        <Input
                            placeholder="Nama Penanggung Jawab"
                            value={pjNama}
                            onChange={(e) => setPjNama(e.target.value)}
                        />
                    </div>
                    <Select value={filters.kib_type || 'all'} onValueChange={handleKibFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Semua Jenis KIB" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Jenis KIB</SelectItem>
                            {Object.entries(kibTypes).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                    <Button type="submit" variant="secondary" size="sm">
                        Cari
                    </Button>
                    {hasFilters && (
                        <Button type="button" variant="ghost" size="sm" onClick={handleClearFilters}>
                            <X className="mr-1 size-4" />
                            Reset
                        </Button>
                    )}
                </form>

                <div className="text-muted-foreground text-sm">
                    {assets.total} aset ditemukan
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No</TableHead>
                                <TableHead>Nama Barang</TableHead>
                                <TableHead>Jenis KIB</TableHead>
                                <TableHead>Kode Barang</TableHead>
                                <TableHead>Wilayah</TableHead>
                                <TableHead>PJ</TableHead>
                                <TableHead className="text-right">Harga</TableHead>
                                <TableHead className="w-16 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                                        Tidak ada aset yang cocok dengan pencarian.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assets.data.map((asset, index) => (
                                    <TableRow key={asset.id}>
                                        <TableCell>{assets.from + index}</TableCell>
                                        <TableCell className="max-w-[200px] truncate font-medium">
                                            {asset.nama_barang}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${KIB_BADGE_COLORS[asset.kib_type] || ''}`}>
                                                KIB {asset.kib_type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm">{asset.kode_barang}</TableCell>
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
                                            <Button variant="ghost" size="icon" className="size-8" asChild>
                                                <Link href={`/assets/kib-${asset.kib_type.toLowerCase()}/${asset.id}`}>
                                                    <Eye className="size-4" />
                                                </Link>
                                            </Button>
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
        </AuthenticatedLayout>
    );
}
