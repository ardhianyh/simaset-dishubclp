import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, Ruangan } from '@/types';
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
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FormEvent, useState } from 'react';

interface Props {
    ruangans: PaginatedData<Ruangan>;
    filters: {
        search?: string;
    };
}

export default function RuanganIndex({ ruangans, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/ruangan', { search: search || undefined }, { preserveState: true });
    }

    function handleDelete(id: number) {
        router.delete(`/ruangan/${id}`, { preserveScroll: true });
    }

    return (
        <AuthenticatedLayout header="Ruangan">
            <Head title="Ruangan" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                placeholder="Cari ruangan..."
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
                        <Link href="/ruangan/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Ruangan
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No</TableHead>
                                <TableHead>Nama Ruangan</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead className="w-32 text-center">Staff</TableHead>
                                <TableHead className="w-28 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ruangans.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                                        Belum ada data ruangan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                ruangans.data.map((ruangan, index) => (
                                    <TableRow key={ruangan.id}>
                                        <TableCell>{ruangans.from + index}</TableCell>
                                        <TableCell className="font-medium">{ruangan.nama}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {ruangan.deskripsi || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                <Users className="mr-1 size-3" />
                                                {ruangan.users_count ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                    <Link href={`/ruangan/${ruangan.id}/edit`}>
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
                                                            <AlertDialogTitle>Hapus Ruangan</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Apakah Anda yakin ingin menghapus ruangan "{ruangan.nama}"?
                                                                Tindakan ini tidak dapat dibatalkan.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(ruangan.id)}
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
                    links={ruangans.links}
                    from={ruangans.from}
                    to={ruangans.to}
                    total={ruangans.total}
                />
            </div>
        </AuthenticatedLayout>
    );
}
