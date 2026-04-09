import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Wilayah } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FormEvent } from 'react';

interface Props {
    wilayahs: Wilayah[];
}

export default function UserCreate({ wilayahs }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nip: '',
        email: '',
        password: '',
        role: 'staff' as 'admin' | 'staff',
        telepon: '',
        is_active: true,
        wilayah_ids: [] as number[],
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/users');
    }

    function toggleWilayah(id: number) {
        setData('wilayah_ids',
            data.wilayah_ids.includes(id)
                ? data.wilayah_ids.filter((wId) => wId !== id)
                : [...data.wilayah_ids, id]
        );
    }

    return (
        <AuthenticatedLayout header="Tambah Pengguna">
            <Head title="Tambah Pengguna" />

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Tambah Pengguna Baru</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nip">NIP</Label>
                                <Input
                                    id="nip"
                                    value={data.nip}
                                    onChange={(e) => setData('nip', e.target.value)}
                                    placeholder="Opsional"
                                />
                                {errors.nip && <p className="text-sm text-red-600">{errors.nip}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="contoh@email.com"
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Minimal 8 karakter"
                                />
                                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select value={data.role} onValueChange={(v: 'admin' | 'staff') => setData('role', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="staff">Staff</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telepon">Telepon</Label>
                                <Input
                                    id="telepon"
                                    value={data.telepon}
                                    onChange={(e) => setData('telepon', e.target.value)}
                                    placeholder="Opsional"
                                />
                                {errors.telepon && <p className="text-sm text-red-600">{errors.telepon}</p>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked === true)}
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">
                                Aktif
                            </Label>
                        </div>

                        {data.role === 'staff' && wilayahs.length > 0 && (
                            <div className="space-y-2">
                                <Label>Wilayah Afiliasi</Label>
                                <div className="rounded-md border p-3">
                                    <div className="space-y-2">
                                        {wilayahs.map((w) => (
                                            <div key={w.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`w-${w.id}`}
                                                    checked={data.wilayah_ids.includes(w.id)}
                                                    onCheckedChange={() => toggleWilayah(w.id)}
                                                />
                                                <Label htmlFor={`w-${w.id}`} className="cursor-pointer font-normal">
                                                    {w.nama}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {data.wilayah_ids.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-1 border-t pt-3">
                                            {data.wilayah_ids.map((id) => {
                                                const w = wilayahs.find((w) => w.id === id);
                                                return w ? (
                                                    <Badge key={id} variant="secondary">{w.nama}</Badge>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </div>
                                {errors.wilayah_ids && <p className="text-sm text-red-600">{errors.wilayah_ids}</p>}
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/users">Batal</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AuthenticatedLayout>
    );
}
