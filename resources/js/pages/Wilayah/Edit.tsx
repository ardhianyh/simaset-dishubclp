import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Wilayah } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormEvent } from 'react';

interface Props {
    wilayah: Wilayah;
}

export default function WilayahEdit({ wilayah }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nama: wilayah.nama,
        deskripsi: wilayah.deskripsi || '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        put(`/wilayah/${wilayah.id}`);
    }

    return (
        <AuthenticatedLayout header="Edit Wilayah">
            <Head title="Edit Wilayah" />

            <div className="mx-auto max-w-2xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Wilayah</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Wilayah *</Label>
                                <Input
                                    id="nama"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="Masukkan nama wilayah"
                                />
                                {errors.nama && (
                                    <p className="text-sm text-red-600">{errors.nama}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deskripsi">Deskripsi</Label>
                                <Textarea
                                    id="deskripsi"
                                    value={data.deskripsi}
                                    onChange={(e) => setData('deskripsi', e.target.value)}
                                    placeholder="Deskripsi wilayah (opsional)"
                                    rows={3}
                                />
                                {errors.deskripsi && (
                                    <p className="text-sm text-red-600">{errors.deskripsi}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/wilayah">Batal</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {wilayah.users && wilayah.users.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Staff Terafiliasi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {wilayah.users.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between rounded-md border p-3">
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-muted-foreground text-sm">{user.email}</p>
                                        </div>
                                        <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
