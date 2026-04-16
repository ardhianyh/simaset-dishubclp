import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Pejabat } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Pagination from '@/components/Pagination';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    pejabats: PaginatedData<Pejabat>;
    filters: {
        search?: string;
    };
}

export default function PejabatsIndex({ pejabats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/pejabats', {
            search: search || undefined,
        }, { preserveState: true });
    }

    function handleDelete(id: number) {
        router.delete(`/pejabats/${id}`, { preserveScroll: true });
    }

    return (
        <AuthenticatedLayout header="Data Pejabat">
            <Head title="Data Pejabat" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                placeholder="Cari nama, NIP, jabatan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64 pl-9"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">
                            Cari
                        </Button>
                    </form>

                    <Button size="sm" asChild>
                        <Link href="/pejabats/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Pejabat
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>NIP</TableHead>
                                <TableHead>Jabatan</TableHead>
                                <TableHead className="w-28 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pejabats.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                                        Belum ada data pejabat.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pejabats.data.map((pejabat, index) => (
                                    <TableRow key={pejabat.id}>
                                        <TableCell>{pejabats.from + index}</TableCell>
                                        <TableCell className="font-medium">{pejabat.nama}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {pejabat.nip || '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {pejabat.jabatan || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                    <Link href={`/pejabats/${pejabat.id}/edit`}>
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8 text-red-600 hover:text-red-700">
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Hapus Pejabat</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Apakah Anda yakin ingin menghapus data pejabat "{pejabat.nama}"?
                                                                Tindakan ini tidak dapat dibatalkan.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(pejabat.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Hapus
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Pagination
                    links={pejabats.links}
                    from={pejabats.from}
                    to={pejabats.to}
                    total={pejabats.total}
                />
            </div>
        </AuthenticatedLayout>
    );
}
