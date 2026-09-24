import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { AssetLoan, PaginatedData } from '@/types';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import Pagination from '@/components/Pagination';
import { Plus, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import KembalikanDialog from './Partials/KembalikanDialog';
import { formatWaktu, terlambat } from '@/utils/waktu';

interface Props {
    loans: PaginatedData<AssetLoan>;
    jumlahDipinjam: number;
    daftarTahun: number[];
    bisaMencatat: boolean;
    filters: {
        status?: string | null;
        tahun?: string | null;
        search?: string | null;
    };
}

const STATUS_OPTIONS = [
    { value: 'semua', label: 'Semua status' },
    { value: 'dipinjam', label: 'Sedang dipinjam' },
    { value: 'kembali', label: 'Sudah kembali' },
];

export default function PeminjamanIndex({ loans, jumlahDipinjam, daftarTahun, bisaMencatat, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function terapkan(ubah: Record<string, string | undefined>) {
        const params = {
            status: filters.status || undefined,
            tahun: filters.tahun || undefined,
            search: search || undefined,
            ...ubah,
        };
        router.get('/peminjaman', params, { preserveState: true });
    }

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        terapkan({ search: search || undefined });
    }

    return (
        <AuthenticatedLayout header="Peminjaman Barang">
            <Head title="Peminjaman Barang" />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Cari barang, peminjam, bidang..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-72 pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary" size="sm">
                                Cari
                            </Button>
                        </form>

                        <Select
                            value={filters.status || 'semua'}
                            onValueChange={(v) => terapkan({ status: v === 'semua' ? undefined : v })}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.tahun || 'semua'}
                            onValueChange={(v) => terapkan({ tahun: v === 'semua' ? undefined : v })}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua tahun</SelectItem>
                                {daftarTahun.map((t) => (
                                    <SelectItem key={t} value={String(t)}>
                                        Tahun {t}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge variant={jumlahDipinjam > 0 ? 'default' : 'secondary'}>
                            {jumlahDipinjam} barang sedang dipinjam
                        </Badge>
                        {bisaMencatat && (
                            <Button size="sm" asChild>
                                <Link href="/peminjaman/create">
                                    <Plus className="mr-2 size-4" />
                                    Catat Peminjaman
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No</TableHead>
                                <TableHead>Barang</TableHead>
                                <TableHead>Peminjam</TableHead>
                                <TableHead>Keperluan</TableHead>
                                <TableHead className="w-44">Dipinjam</TableHead>
                                <TableHead className="w-48">Dikembalikan</TableHead>
                                <TableHead className="w-32 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loans.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                                        Belum ada peminjaman barang yang tercatat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                loans.data.map((loan, index) => {
                                    const kibSlug = loan.asset ? `kib-${loan.asset.kib_type.toLowerCase()}` : null;
                                    const lewat = terlambat(loan.rencana_kembali, loan.dikembalikan_pada);

                                    return (
                                        <TableRow key={loan.id}>
                                            <TableCell>{loans.from + index}</TableCell>
                                            <TableCell>
                                                {loan.asset && kibSlug ? (
                                                    <Link
                                                        href={`/assets/${kibSlug}/${loan.asset.id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {loan.asset.nama_barang}
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground">(aset dihapus)</span>
                                                )}
                                                <p className="text-muted-foreground font-mono text-xs">
                                                    {loan.asset?.kode_barang} · {loan.asset?.nomor_register}
                                                </p>
                                                {loan.ruangan_asal_nama && (
                                                    <p className="text-muted-foreground text-xs">Milik {loan.ruangan_asal_nama}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">{loan.peminjam_nama}</p>
                                                <p className="text-muted-foreground text-xs">{loan.peminjam_ruangan_nama}</p>
                                            </TableCell>
                                            <TableCell className="max-w-64 text-sm whitespace-normal">
                                                {loan.keperluan}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {formatWaktu(loan.dipinjam_pada)}
                                                {loan.rencana_kembali && (
                                                    <p className={`text-xs ${lewat ? 'font-medium text-red-600' : 'text-muted-foreground'}`}>
                                                        Rencana kembali {formatWaktu(loan.rencana_kembali)}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {loan.dikembalikan_pada ? (
                                                    <>
                                                        <Badge variant="secondary">Sudah kembali</Badge>
                                                        <p className="mt-1">{formatWaktu(loan.dikembalikan_pada)}</p>
                                                        {loan.catatan_kembali && (
                                                            <p className="text-muted-foreground text-xs">{loan.catatan_kembali}</p>
                                                        )}
                                                    </>
                                                ) : (
                                                    <Badge variant={lewat ? 'destructive' : 'default'}>
                                                        {lewat ? 'Terlambat' : 'Sedang dipinjam'}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!loan.dikembalikan_pada && loan.can_manage && <KembalikanDialog loan={loan} />}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination links={loans.links} from={loans.from} to={loans.to} total={loans.total} />
            </div>
        </AuthenticatedLayout>
    );
}
