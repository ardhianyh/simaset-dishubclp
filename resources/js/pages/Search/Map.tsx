import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Asset, Wilayah } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import MapView, { MapAsset } from '@/components/MapView';
import { Search, X, Eye } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    assets: MapAsset[];
    wilayahs: Wilayah[];
    kibTypes: Record<string, string>;
    filters: {
        search?: string;
        kib_type?: string;
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

const KIB_BADGE_COLORS: Record<string, string> = {
    A: 'bg-green-100 text-green-800',
    B: 'bg-blue-100 text-blue-800',
    C: 'bg-amber-100 text-amber-800',
    D: 'bg-purple-100 text-purple-800',
    E: 'bg-red-100 text-red-800',
    L: 'bg-cyan-100 text-cyan-800',
};

export default function SearchMap({ assets, wilayahs, kibTypes, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedAsset, setSelectedAsset] = useState<MapAsset | null>(null);

    function buildParams(overrides: Record<string, string | undefined> = {}) {
        return {
            search: filters.search || undefined,
            kib_type: filters.kib_type || undefined,
            wilayah_id: filters.wilayah_id || undefined,
            ...overrides,
        };
    }

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/search/map', buildParams({
            search: search || undefined,
        }), { preserveState: true });
    }

    function handleKibFilter(value: string) {
        router.get('/search/map', buildParams({
            kib_type: value === 'all' ? undefined : value,
        }), { preserveState: true });
    }

    function handleWilayahFilter(value: string) {
        router.get('/search/map', buildParams({
            wilayah_id: value === 'all' ? undefined : value,
        }), { preserveState: true });
    }

    function handleClearFilters() {
        setSearch('');
        setSelectedAsset(null);
        router.get('/search/map', {}, { preserveState: true });
    }

    const hasFilters = filters.search || filters.kib_type || filters.wilayah_id;

    return (
        <AuthenticatedLayout header="Peta Aset">
            <Head title="Peta Aset" />

            <div className="space-y-4">
                <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                        <Input
                            placeholder="Cari nama, kode, PJ..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
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

                <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-sm">
                        {assets.length} aset dengan koordinat
                    </div>
                    <div className="flex items-center gap-2">
                        {Object.entries(KIB_BADGE_COLORS).map(([type, colors]) => (
                            <span key={type} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}>
                                KIB {type}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="rounded-md border overflow-hidden">
                    <MapView
                        assets={assets}
                        className="h-[calc(100vh-320px)] min-h-[400px] w-full"
                        onMarkerClick={setSelectedAsset}
                    />
                </div>

                {selectedAsset && (
                    <div className="rounded-md border bg-card p-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{selectedAsset.nama_barang}</h3>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${KIB_BADGE_COLORS[selectedAsset.kib_type] || ''}`}>
                                        KIB {selectedAsset.kib_type}
                                    </span>
                                </div>
                                <div className="text-muted-foreground flex items-center gap-4 text-sm">
                                    <span>Kode: <span>{selectedAsset.kode_barang}</span></span>
                                    {selectedAsset.wilayah && (
                                        <span>Wilayah: <Badge variant="outline">{selectedAsset.wilayah.nama}</Badge></span>
                                    )}
                                    <span>PJ: {selectedAsset.pj_nama}</span>
                                    <span>Harga: {formatCurrency(selectedAsset.harga)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/assets/kib-${selectedAsset.kib_type.toLowerCase()}/${selectedAsset.id}`}>
                                        <Eye className="mr-2 size-4" />
                                        Detail
                                    </Link>
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setSelectedAsset(null)}>
                                    <X className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
