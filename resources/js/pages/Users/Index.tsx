import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PaginatedData, User } from '@/types';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { FormEvent, useState } from 'react';

interface Props {
    users: PaginatedData<User>;
    filters: {
        search?: string;
        role?: string;
    };
}

export default function UsersIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get('/users', {
            search: search || undefined,
            role: filters.role || undefined,
        }, { preserveState: true });
    }

    function handleRoleFilter(value: string) {
        router.get('/users', {
            search: filters.search || undefined,
            role: value === 'all' ? undefined : value,
        }, { preserveState: true });
    }

    function handleDelete(id: number) {
        router.delete(`/users/${id}`, { preserveScroll: true });
    }

    return (
        <AuthenticatedLayout header="Pengguna">
            <Head title="Pengguna" />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input
                                    placeholder="Cari nama, email, NIP..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-64 pl-9"
                                />
                            </div>
                            <Button type="submit" variant="secondary" size="sm">
                                Cari
                            </Button>
                        </form>
                        <Select value={filters.role || 'all'} onValueChange={handleRoleFilter}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Semua role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button size="sm" asChild>
                        <Link href="/users/create">
                            <Plus className="mr-2 size-4" />
                            Tambah Pengguna
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">No</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>NIP</TableHead>
                                <TableHead className="text-center">Role</TableHead>
                                <TableHead>Wilayah</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="w-28 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-muted-foreground py-8 text-center">
                                        Belum ada data pengguna.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.data.map((user, index) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{users.from + index}</TableCell>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {user.nip || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.wilayahs && user.wilayahs.length > 0
                                                    ? user.wilayahs.map((w) => (
                                                        <Badge key={w.id} variant="outline" className="text-xs">
                                                            {w.nama}
                                                        </Badge>
                                                    ))
                                                    : <span className="text-muted-foreground text-sm">-</span>
                                                }
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={user.is_active ? 'default' : 'destructive'}>
                                                {user.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                    <Link href={`/users/${user.id}/edit`}>
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
                                                            <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Apakah Anda yakin ingin menghapus pengguna "{user.name}"?
                                                                Tindakan ini tidak dapat dibatalkan.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(user.id)}
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
                    links={users.links}
                    from={users.from}
                    to={users.to}
                    total={users.total}
                />
            </div>
        </AuthenticatedLayout>
    );
}
