import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormEvent } from 'react';

export default function WilayahCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        deskripsi: '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/wilayah');
    }

    return (
        <AuthenticatedLayout header="Tambah Wilayah">
            <Head title="Tambah Wilayah" />

            <Card className="mx-auto max-w-2xl">
                <CardHeader>
                    <CardTitle>Tambah Wilayah Baru</CardTitle>
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
        </AuthenticatedLayout>
    );
}
