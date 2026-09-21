import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { AssetMutation, PaginatedData } from '@/types';
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
import Pagination from '@/components/Pagination';
import { ArrowRight, Eye, Package, Plus, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    mutations: PaginatedData<AssetMutation>;
    filters: {
        search?: string;
    };
}

function formatTanggal(tanggal: string) {
    return new Date(tanggal).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

export default function MutasiIndex({ mutations, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/mutasi', { search: search || undefined }, { preserveState: true });
    }

    return (
        <AuthenticatedLayout header="Pergeseran Barang">
            <Head title="Pergeseran Barang" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                placeholder="Cari nomor BAST atau ruangan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-72 pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">
                            Cari
                        </Button>
                    </form>

                    <Button size="sm" asChild>
                        <Link href="/mutasi/create">
                            <Plus className="mr-2 size-4" />
                            Geser Barang
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No</TableHead>
                                <TableHead className="w-36">Tanggal</TableHead>
                                <TableHead>Nomor BAST</TableHead>
                                <TableHead>Perpindahan</TableHead>
                                <TableHead className="w-28 text-center">Jumlah</TableHead>
                                <TableHead className="w-20 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mutations.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-muted-foreground py-8 text-center">
                                        Belum ada pergeseran barang yang tercatat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                mutations.data.map((mutation, index) => (
                                    <TableRow key={mutation.id}>
                                        <TableCell>{mutations.from + index}</TableCell>
                                        <TableCell>{formatTanggal(mutation.tanggal)}</TableCell>
                                        <TableCell className="font-medium">{mutation.nomor_bast}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span>{mutation.ruangan_asal_nama}</span>
                                                <ArrowRight className="text-muted-foreground size-4 shrink-0" />
                                                <span className="font-medium">{mutation.ruangan_tujuan_nama}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                <Package className="mr-1 size-3" />
                                                {mutation.items_count ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="size-8" asChild>
                                                <Link href={`/mutasi/${mutation.id}`}>
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
                    links={mutations.links}
                    from={mutations.from}
                    to={mutations.to}
                    total={mutations.total}
                />
            </div>
        </AuthenticatedLayout>
    );
}
