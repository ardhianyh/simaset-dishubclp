import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { LandPlot, Wrench, Building2, Route, BookOpen, FileBox, Package, Banknote } from 'lucide-react';
import { PageProps } from '@/types';
import { MapAsset } from '@/components/MapView';
import { lazy, Suspense } from 'react';

const MapView = lazy(() => import('@/components/MapView'));

interface KibStat {
    label: string;
    count: number;
    total_value: number;
}

interface WilayahStat {
    id: number;
    nama: string;
    count: number;
    total_value: number;
}

interface Props extends PageProps {
    perKib: Record<string, KibStat>;
    perWilayah: WilayahStat[];
    totalCount: number;
    totalValue: number;
    mapAssets: MapAsset[];
}

const kibCards = [
    { key: 'A', title: 'KIB A', subtitle: 'Tanah', icon: LandPlot, color: 'text-green-600', slug: 'kib-a' },
    { key: 'B', title: 'KIB B', subtitle: 'Peralatan & Mesin', icon: Wrench, color: 'text-blue-600', slug: 'kib-b' },
    { key: 'C', title: 'KIB C', subtitle: 'Gedung & Bangunan', icon: Building2, color: 'text-amber-600', slug: 'kib-c' },
    { key: 'D', title: 'KIB D', subtitle: 'Jalan, Irigasi, Jaringan', icon: Route, color: 'text-purple-600', slug: 'kib-d' },
    { key: 'E', title: 'KIB E', subtitle: 'Aset Tetap Lainnya', icon: BookOpen, color: 'text-red-600', slug: 'kib-e' },
    { key: 'L', title: 'KIB L', subtitle: 'Aset Lainnya', icon: FileBox, color: 'text-cyan-600', slug: 'kib-l' },
];

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
}

export default function Dashboard() {
    const { auth, perKib, perWilayah, totalCount, totalValue, mapAssets } = usePage<Props>().props;

    return (
        <AuthenticatedLayout header="Dashboard">
            <Head title="Dashboard" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Selamat datang, {auth.user.name}
                    </h2>
                    <p className="text-muted-foreground">
                        Ringkasan aset inventaris barang dinas.
                    </p>
                </div>

                {/* Grand total cards */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
                            <Package className="text-muted-foreground size-5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{formatNumber(totalCount)}</div>
                            <p className="text-muted-foreground text-xs">aset tercatat</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Nilai Aset</CardTitle>
                            <Banknote className="text-muted-foreground size-5" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{formatCurrency(totalValue)}</div>
                            <p className="text-muted-foreground text-xs">nilai keseluruhan</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Per KIB cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {kibCards.map((kib) => {
                        const stat = perKib[kib.key];
                        return (
                            <Link key={kib.key} href={`/assets/${kib.slug}`} className="block">
                                <Card className="transition-shadow hover:shadow-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">{kib.title}</CardTitle>
                                        <kib.icon className={`size-5 ${kib.color}`} />
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground text-xs">{kib.subtitle}</p>
                                        <div className="mt-2 text-2xl font-bold">{formatNumber(stat?.count ?? 0)}</div>
                                        <p className="text-muted-foreground text-xs">
                                            {formatCurrency(stat?.total_value ?? 0)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Per Wilayah table */}
                {perWilayah.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Distribusi Aset per Wilayah</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Wilayah</TableHead>
                                            <TableHead className="text-right">Jumlah Aset</TableHead>
                                            <TableHead className="text-right">Total Nilai</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {perWilayah.map((w) => (
                                            <TableRow key={w.id}>
                                                <TableCell>
                                                    <Badge variant="outline">{w.nama}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatNumber(w.count)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm">
                                                    {formatCurrency(w.total_value)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Map overview */}
                {mapAssets.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Peta Sebaran Aset</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={<div className="flex h-[400px] items-center justify-center text-muted-foreground">Memuat peta...</div>}>
                                <MapView assets={mapAssets} className="h-[400px] w-full rounded-md" />
                            </Suspense>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
