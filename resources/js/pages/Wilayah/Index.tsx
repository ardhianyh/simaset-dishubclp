import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PaginatedData, Wilayah } from '@/types';
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
    wilayahs: PaginatedData<Wilayah>;
    filters: {
        search?: string;
    };
}

export default function WilayahIndex({ wilayahs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/wilayah', { search: search || undefined }, { preserveState: true });
    }

    function handleDelete(id: number) {
        router.delete(`/wilayah/${id}`, { preserveScroll: true });
    }

    return (
        <AuthenticatedLayout header="Wilayah">
            <Head title="Wilayah" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                placeholder="Cari wilayah..."
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
                        <Link href="/wilayah/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Wilayah
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No</TableHead>
                                <TableHead>Nama Wilayah</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead className="w-32 text-center">Staff</TableHead>
                                <TableHead className="w-28 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {wilayahs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                                        Belum ada data wilayah.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                wilayahs.data.map((wilayah, index) => (
                                    <TableRow key={wilayah.id}>
                                        <TableCell>{wilayahs.from + index}</TableCell>
                                        <TableCell className="font-medium">{wilayah.nama}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {wilayah.deskripsi || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">
                                                <Users className="mr-1 size-3" />
                                                {wilayah.users_count ?? 0}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                    <Link href={`/wilayah/${wilayah.id}/edit`}>
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
                                                            <AlertDialogTitle>Hapus Wilayah</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Apakah Anda yakin ingin menghapus wilayah "{wilayah.nama}"?
                                                                Tindakan ini tidak dapat dibatalkan.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(wilayah.id)}
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
                    links={wilayahs.links}
                    from={wilayahs.from}
                    to={wilayahs.to}
                    total={wilayahs.total}
                />
            </div>
        </AuthenticatedLayout>
    );
}
